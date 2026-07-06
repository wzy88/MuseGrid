import { expect, test } from "@playwright/test";

test("creator onboarding", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("MuseGrid Lyric Creator");
  await page.getByLabel("邮箱").fill(`creator-onboarding-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();

  await page.getByRole("navigation", { name: "主导航" }).getByRole("link", { name: "申请入驻" }).click();
  await expect(page).toHaveURL("/become-creator");
  await expect(page.locator("h1")).toHaveText("成为创作人");

  await page.getByRole("radio", { name: /^作词/ }).click();
  await expect(page.getByText("当前方向：作词")).toBeVisible();
  await page.getByRole("button", { name: "下一步" }).click();

  await page.getByLabel("创作人名称").fill("夜航作词人");
  await page.getByLabel("一句话介绍").fill("擅长都市夜色、克制情绪和旋律化叙事。");
  await page.getByLabel("擅长风格").fill("R&B, City Pop");
  await page.getByLabel("代表经验").fill("给独立音乐人写过 20 首情绪流行作品。");
  await page.getByLabel("案例描述").fill("曾为一首深夜公路题材作品完成主歌与副歌歌词结构设计。");
  await page.getByRole("button", { name: "上一步" }).click();
  await page.getByRole("radio", { name: /^作词/ }).click();
  await expect(page.getByText("当前方向：作词")).toBeVisible();
  await page.getByRole("button", { name: "下一步" }).click();
  await expect(page.getByLabel("创作人名称")).toHaveValue("夜航作词人");
  await expect(page.getByLabel("案例描述")).toHaveValue("曾为一首深夜公路题材作品完成主歌与副歌歌词结构设计。");
  await page.getByRole("button", { name: "下一步" }).click();

  await page.getByLabel("你最擅长的创作切入方式").fill("先确认画面和叙事视角，再写钩子句。");
  await page.getByLabel("你会如何校正分身输出").fill("标注空泛句、节奏问题和不符合题材的意象。");
  await page.getByLabel("你希望分身避免什么").fill("不要模仿具体歌手，也不要堆砌陈词滥调。");
  await page.getByRole("button", { name: "下一步" }).click();

  await expect(page.getByText("Level 1 创作人分身", { exact: true })).toBeVisible();
  await expect(page.getByText("继续补充作品样本，让分身学会你的取舍标准。")).toBeVisible();
  const submitButton = page.getByRole("button", { name: "提交申请" });
  await expect(submitButton).toBeVisible();
  await Promise.all([page.waitForURL("/avatar-dashboard"), submitButton.click()]);

  await expect(page.getByRole("heading", { level: 1, name: "创作人分身后台" })).toBeVisible();
  await expect(page.getByLabel("avatar dashboard summary").getByText("待审核")).toBeVisible();
});
