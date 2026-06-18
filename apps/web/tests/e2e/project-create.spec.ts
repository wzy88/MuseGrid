import { expect, test } from "@playwright/test";

test("registered user creates a song project from studio home", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("MuseGrid Creator");
  await page.getByLabel("邮箱").fill(`creator-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();

  await page.getByLabel("项目名称").fill("霓虹夜航");
  await page.getByLabel("歌曲灵感").fill("想写一首适合深夜开车听的中文 R&B，带一点未来感和释怀");
  await page.getByLabel("语言").fill("中文");
  await page.getByLabel("曲风").fill("R&B");
  await page.getByLabel("情绪").fill("释怀");
  await page.getByLabel("用途").fill("个人发行");
  await page.getByRole("button", { name: "开始制作" }).click();

  await expect(page).toHaveURL(/\/studio\/projects\/[^/]+$/);
  await expect(page.getByText("霓虹夜航")).toBeVisible();
});
