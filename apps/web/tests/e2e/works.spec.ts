import { expect, test } from "@playwright/test";

test("works library shows playable result detail after demo generation", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("Works Viewer");
  await page.getByLabel("邮箱").fill(`works-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();

  await page.getByLabel("项目名称").fill("玻璃海面");
  await page.getByLabel("歌曲灵感").fill("写一首中文合成器流行，像凌晨城市反光那样冷静但有推进感。");
  await page.getByLabel("语言").fill("中文");
  await page.getByLabel("曲风").fill("合成器流行");
  await page.getByLabel("情绪").fill("冷静推进");
  await page.getByLabel("用途").fill("作品归档");
  await page.getByRole("button", { name: "开始制作" }).click();

  await expect(page).toHaveURL(/\/studio\/projects\/[^/]+$/);

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

  const productionWorkspace = page.getByRole("region", { name: "制作" });
  await expect(productionWorkspace.locator('audio[aria-label="可播放 Demo"]')).toBeVisible({ timeout: 15000 });

  await page.getByRole("link", { name: "我的作品" }).click();
  await expect(page).toHaveURL(/\/works$/);
  await expect(page.getByRole("heading", { level: 1, name: "我的作品" })).toBeVisible();
  await expect(page.getByText("玻璃海面")).toBeVisible();
  const libraryEditLink = page.getByRole("link", { name: "编辑作品" }).first();
  await expect(libraryEditLink).toHaveAttribute("href", /\/studio\/projects\/[^/]+$/);

  await page.getByRole("link", { name: "查看详情" }).first().click();
  await expect(page).toHaveURL(/\/works\/[^/]+$/);
  const projectId = page.url().split("/").pop();
  if (!projectId) {
    throw new Error("Expected work detail URL to include a project id");
  }
  await expect(page.getByRole("heading", { name: "作品结果" })).toBeVisible();
  await expect(page.getByRole("link", { name: "编辑作品" })).toHaveAttribute("href", `/studio/projects/${projectId}`);
  await expect(page.getByRole("link", { name: "下载 MP3" })).toHaveAttribute(
    "href",
    /\/api\/v1\/projects\/[^/]+\/download-audio$/,
  );
  await expect(page.getByRole("heading", { name: "作品舞台" })).toBeVisible();
  await expect(page.locator(".workStageHero")).toBeVisible();
  await expect(page.locator(".workCoverCard")).toBeVisible();
  await expect(page.locator(".workSpotlightPanel")).toBeVisible();
  await expect(page.getByRole("region", { name: "作品播放器" })).toBeVisible();
  await expect(page.locator('audio[aria-label="作品播放"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "7 天模拟数据" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "模拟创收（未来 7 天）" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "快送分享" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "导出与下载" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Contribution Chain" }).getByRole("listitem")).toHaveCount(5);
  const playbackDock = page.getByLabel("底部播放控制条");
  await expect(playbackDock).toBeVisible();
  await playbackDock.getByRole("button", { name: "开始底部播放" }).click();
  await expect(playbackDock.getByRole("button", { name: "暂停底部播放" })).toBeVisible();
});
