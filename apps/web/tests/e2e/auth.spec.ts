import { expect, test } from "@playwright/test";

test("user registers and lands inside MuseGrid app shell", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("MuseGrid Tester");
  await page.getByLabel("邮箱").fill(`tester-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "新建歌曲项目" })).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "主导航" });
  await expect(navigation.getByText("创作", { exact: true })).toBeVisible();
  await expect(navigation.getByText("创作人", { exact: true })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "创作台" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "我的作品" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "申请入驻" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "分身管理" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "成为创作人" })).toHaveCount(0);
  await expect(navigation.getByRole("link", { name: "分身后台" })).toHaveCount(0);
  await expect(navigation.getByRole("link", { name: "创作人分身" })).toHaveCount(0);
  await expect(navigation.getByRole("link", { name: "贡献链路" })).toHaveCount(0);
  await expect(navigation.getByRole("link", { name: "账户" })).toHaveCount(0);
});

test("local tester enters studio without registering again", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "使用测试账号进入" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "新建歌曲项目" })).toBeVisible();
  await expect(page.getByText("MuseGrid Tester")).toBeVisible();
});
