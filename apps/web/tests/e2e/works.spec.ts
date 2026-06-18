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
    { stepName: "作词", generateLabel: "生成歌词草案", confirmLabel: "确认作词成果" },
    { stepName: "作曲", generateLabel: "生成旋律结构", confirmLabel: "确认作曲成果" },
    { stepName: "编曲", generateLabel: "生成编曲方案", confirmLabel: "确认编曲成果" },
    { stepName: "制作", generateLabel: "生成可播放 Demo", confirmLabel: "确认制作成果" },
  ] as const;
  const stepRail = page.getByRole("region", { name: "歌曲制作步骤" });

  for (const [index, step] of steps.entries()) {
    await stepRail.getByRole("button").nth(index).click();
    const workspace = page.getByRole("region", { name: step.stepName });
    const firstAvatar = page.getByRole("radiogroup", { name: "创作人分身选择器" }).getByRole("radio").first();
    await firstAvatar.click();
    await expect(firstAvatar).toBeChecked();
    await workspace.getByRole("button", { name: step.generateLabel, exact: true }).click();
    const confirmButton = workspace.getByRole("button", { name: step.confirmLabel, exact: true });
    await expect(confirmButton).toBeEnabled({ timeout: 10000 });
    await confirmButton.click();
  }

  const productionWorkspace = page.getByRole("region", { name: "制作" });
  await productionWorkspace.getByRole("button", { name: "生成可播放 Demo", exact: true }).click();
  await expect(page.locator('audio[aria-label="可播放 Demo"]')).toBeVisible();

  await page.getByRole("link", { name: "我的作品" }).click();
  await expect(page).toHaveURL(/\/works$/);
  await expect(page.getByRole("heading", { level: 1, name: "我的作品" })).toBeVisible();
  await expect(page.getByText("玻璃海面")).toBeVisible();

  await page.getByRole("link", { name: "查看详情" }).first().click();
  await expect(page).toHaveURL(/\/works\/[^/]+$/);
  await expect(page.getByRole("heading", { name: "作品结果" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Waveform Player" })).toBeVisible();
  await expect(page.locator('audio[aria-label="作品播放"]')).toBeVisible();
  await expect(page.locator(".contributionItem")).toHaveCount(4);
  await expect(page.getByRole("heading", { name: "7 天后模拟" })).toBeVisible();
});
