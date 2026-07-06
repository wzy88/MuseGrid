import { expect, test } from "@playwright/test";

type StepDefinition = {
  stepName: string;
  generateLabel: string;
  confirmLabel: string;
};

const studioSteps: StepDefinition[] = [
  { stepName: "作词", generateLabel: "召唤他作词", confirmLabel: "确认作词成果，进入作曲" },
  { stepName: "作曲", generateLabel: "召唤他作曲", confirmLabel: "确认作曲成果，进入编曲" },
  { stepName: "编曲", generateLabel: "召唤他编曲", confirmLabel: "确认编曲成果，进入制作" },
  { stepName: "制作", generateLabel: "召唤他制作", confirmLabel: "确认制作成果，生成 Demo" },
];

test.describe("visual regression", () => {
  test("desktop studio shell keeps nav and primary action visible without horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/register");
    await page.getByLabel("名称").fill("Visual Desktop");
    await page.getByLabel("邮箱").fill(`visual-desktop-${Date.now()}@musegrid.local`);
    await page.getByLabel("密码").fill("musegrid-pass-123");
    await page.getByRole("button", { name: "创建账户" }).click();

    await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();
    await expect(page.getByRole("button", { name: "开始制作" })).toBeVisible();
    await expect(page.getByRole("button", { name: "开始制作" })).toContainText("开始制作");

    const hasHorizontalScroll = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth > root.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test("mobile result page keeps nav, button text, and player visible without horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/register");
    await page.getByLabel("名称").fill("Visual Mobile");
    await page.getByLabel("邮箱").fill(`visual-mobile-${Date.now()}@musegrid.local`);
    await page.getByLabel("密码").fill("musegrid-pass-123");
    await page.getByRole("button", { name: "创建账户" }).click();

    await page.getByLabel("项目名称").fill("流明回声");
    await page.getByLabel("歌曲灵感").fill("让霓虹街景和低速脉冲一起推进，做一首适合深夜循环的中文 Future Pop。");
    await page.getByLabel("语言").fill("中文");
    await page.getByLabel("曲风").fill("Future Pop");
    await page.getByLabel("情绪").fill("漂浮推进");
    await page.getByLabel("用途").fill("移动端试听");
    await page.getByRole("button", { name: "开始制作" }).click();
    await expect(page).toHaveURL(/\/studio\/projects\/[^/]+$/);
    await expect(page.getByRole("heading", { name: "待选择" })).toBeVisible();
    await expect(page.getByRole("radio", { name: /自己写/ })).toBeVisible();
    await expect(page.getByRole("radio", { name: /召唤创作人分身/ })).toBeVisible();
    await expect(page.getByRole("status", { name: "创作记录状态" })).toContainText("贡献记录 0/4");
    await expect(page.getByRole("heading", { name: "确认并进入下一步" })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "生成状态栏" })).toHaveCount(0);
    const projectId = page.url().split("/").pop();
    if (!projectId) {
      throw new Error("missing project id");
    }

    const mobileProgress = page.locator(".studioMobileProgress");

    for (const [index, step] of studioSteps.entries()) {
      await mobileProgress.locator("button").nth(index).click();
      const workspace = page.getByRole("region", { name: step.stepName });
      await workspace.getByRole("radio", { name: /召唤创作人分身/ }).click();
      const firstAvatar = workspace.getByRole("radiogroup", { name: "创作人分身选择器" }).getByRole("radio").first();
      await firstAvatar.click();
      await expect(firstAvatar).toBeChecked();
      const generateButton = workspace.getByRole("button", { name: step.generateLabel, exact: true });
      await expect(generateButton).toBeEnabled({ timeout: 15000 });
      await generateButton.click();
      const confirmButton = workspace.getByRole("button", { name: step.confirmLabel, exact: true });
      await expect(confirmButton).toBeEnabled({ timeout: 15000 });
      await confirmButton.click();
    }

    await expect(page.getByRole("heading", { name: "Demo Player" })).toBeVisible();
    await page.goto(`/works/${projectId}`);

    await expect(page.getByRole("navigation", { name: "主导航" })).toBeVisible();
    await expect(page.getByRole("button", { name: "复制分享链接" })).toBeVisible();
    await expect(page.getByRole("button", { name: "复制分享链接" })).toContainText("复制分享链接");
    await expect(page.getByLabel("Waveform Player")).toBeVisible();
    await expect(page.locator(".waveformPlayerPanel.mgPanel")).toBeVisible();
    await expect(page.locator(".waveformPlayerPanel .mgStatusBadge")).toBeVisible();
    await expect(page.locator(".sevenDayMetricsPanel.mgPanel")).toBeVisible();
    await expect(page.locator(".sevenDayMetricsPanel .mgStatusBadge")).toContainText("近 7 天");
    await expect(page.locator(".revenueSimulationPanel.mgPanel")).toBeVisible();
    await expect(page.locator(".revenueSimulationPanel .mgStatusBadge")).toContainText("预计结算");
    await expect(page.locator(".workSummaryPanel.mgPanel")).toBeVisible();
    await expect(page.locator(".workLyricsPanel.mgPanel")).toBeVisible();
    await expect(page.locator(".workHeroActions .mgStatusBadge")).toContainText(/sample|MiniMax/i);
    await expect(page.locator(".workSummaryPanel .mgStatusBadge")).toContainText("制作");
    await expect(page.locator(".workLyricsPanel .mgStatusBadge")).toContainText("作词");

    const hasHorizontalScroll = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth > root.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });
});
