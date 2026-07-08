import { expect, test } from "@playwright/test";

test("generate demo uses sample fallback and keeps the studio contribution record lightweight", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("Demo Generator");
  await page.getByLabel("邮箱").fill(`generate-demo-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();

  await page.getByLabel("项目名称").fill("午夜高架");
  await page.getByLabel("歌曲灵感").fill("写一首适合夜间开车时播放的中文电子流行，带一点克制的速度感");
  await page.getByLabel("语言").fill("中文");
  await page.getByLabel("曲风").fill("电子流行");
  await page.getByLabel("情绪").fill("冷静推进");
  await page.getByLabel("用途").fill("平台内试听");
  await page.getByRole("button", { name: "开始制作" }).click();

  await expect(page).toHaveURL(/\/studio\/projects\/[^/]+$/);
  const projectUrl = page.url();
  const projectId = projectUrl.split("/").pop();
  if (!projectId) {
    throw new Error("missing project id");
  }

  const steps = [
    { stepName: "作词", generateLabel: "召唤他作词", confirmLabel: "确认作词成果，进入作曲" },
    { stepName: "作曲", generateLabel: "召唤他作曲", confirmLabel: "确认作曲成果，进入编曲" },
    { stepName: "编曲", generateLabel: "召唤他编曲", confirmLabel: "确认编曲成果，进入选声" },
    { stepName: "选声", generateLabel: "召唤他选声", confirmLabel: "确认声音方向，进入制作" },
    { stepName: "制作", generateLabel: "召唤他制作", confirmLabel: "确认制作成果，生成 Demo" },
  ] as const;
  const stepRail = page.getByRole("region", { name: "歌曲制作步骤" });

  for (const [index, step] of steps.entries()) {
    await stepRail.getByRole("button").nth(index).click();
    const workspace = page.getByRole("region", { name: step.stepName });
    await workspace.getByRole("radio", { name: /召唤创作人分身/ }).click();
    const firstAvatar = workspace.getByRole("radiogroup", { name: "创作人分身选择器" }).getByRole("radio").first();
    await firstAvatar.click();
    await expect(firstAvatar).toBeChecked();
    await workspace.getByRole("button", { name: step.generateLabel, exact: true }).click();
    const confirmButton = workspace.getByRole("button", { name: step.confirmLabel, exact: true });
    await expect(confirmButton).toBeEnabled({ timeout: 10000 });
    await confirmButton.click();
  }

  await expect(page.getByRole("heading", { name: "Demo Player" })).toBeVisible();
  await expect(page.locator('audio[aria-label="可播放 Demo"]')).toBeVisible();
  await expect(page.getByRole("status", { name: "创作记录状态" })).toContainText("贡献记录 5/5");
  await expect(page.getByRole("list", { name: "Contribution Chain" })).toHaveCount(0);
  await expect(page.getByText("sample")).toBeVisible();

  const projectPayload: {
    ok: true;
    status: number;
    body: {
      ok: true;
      data: { generations: Array<{ provider: string; status: string }> };
    };
  } | {
    ok: false;
    status: number;
    body: string;
  } = await page.evaluate(async (id) => {
    const response = await fetch(`/api/v1/projects/${id}`);
    if (!response.ok) {
      return { ok: false, status: response.status, body: await response.text() };
    }

    return {
      ok: true,
      status: response.status,
      body: (await response.json()) as {
        ok: true;
        data: { generations: Array<{ provider: string; status: string }> };
      },
    };
  }, projectId);

  expect(projectPayload.ok).toBe(true);
  if (!projectPayload.ok) {
    throw new Error(`project API failed with status ${projectPayload.status}: ${String(projectPayload.body)}`);
  }

  const body = projectPayload.body;
  expect(body.data.generations.length).toBeGreaterThan(0);
  expect(body.data.generations.at(-1)).toMatchObject({
    provider: "sample",
    status: "completed",
  });
});
