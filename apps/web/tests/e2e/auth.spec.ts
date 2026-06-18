import { expect, test } from "@playwright/test";

test("user registers and lands inside MuseGrid app shell", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("MuseGrid Tester");
  await page.getByLabel("邮箱").fill(`tester-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();
  await expect(page.getByText("新建歌曲项目")).toBeVisible();
  await expect(page.getByText("创作台")).toBeVisible();
});
