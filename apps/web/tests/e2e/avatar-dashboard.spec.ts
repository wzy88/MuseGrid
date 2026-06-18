import { expect, test } from "@playwright/test";

test("avatar dashboard shows level 1 evolution state after onboarding", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("MuseGrid Avatar Dashboard");
  await page.getByLabel("邮箱").fill(`avatar-dashboard-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();

  await page.getByRole("navigation", { name: "MuseGrid" }).getByRole("link", { name: "成为创作人" }).click();
  await expect(page).toHaveURL("/become-creator");

  await page.getByRole("radio", { name: "作词" }).check();
  await page.getByRole("button", { name: "下一步" }).click();

  await page.getByLabel("创作人名称").fill("夜航作词人");
  await page.getByLabel("一句话介绍").fill("擅长都市夜色、克制情绪和旋律化叙事。");
  await page.getByLabel("擅长风格").fill("R&B, City Pop");
  await page.getByLabel("代表经验").fill("给独立音乐人写过 20 首情绪流行作品。");
  await page.getByLabel("案例描述").fill("曾为一首深夜公路题材作品完成主歌与副歌歌词结构设计。");
  await page.getByRole("button", { name: "下一步" }).click();

  await page.getByLabel("你最擅长的创作切入方式").fill("先确认画面和叙事视角，再写钩子句。");
  await page.getByLabel("你会如何校正分身输出").fill("标注空泛句、节奏问题和不符合题材的意象。");
  await page.getByLabel("你希望分身避免什么").fill("不要模仿具体歌手，也不要堆砌陈词滥调。");
  await page.getByRole("button", { name: "下一步" }).click();

  await Promise.all([
    page.waitForURL("/avatar-dashboard"),
    page.getByRole("button", { name: "提交申请" }).click(),
  ]);

  await expect(page.getByRole("heading", { level: 1, name: "创作人分身后台" })).toBeVisible();
  const capabilityMatrix = page.getByRole("region", { name: "能力线等级矩阵" });
  await expect(capabilityMatrix.getByText("作词 Level 1", { exact: true })).toBeVisible();

  await expect(capabilityMatrix.getByText("作曲 未开启", { exact: true })).toBeVisible();
  await expect(capabilityMatrix.getByText("编曲 未开启", { exact: true })).toBeVisible();
  await expect(capabilityMatrix.getByText("制作 未开启", { exact: true })).toBeVisible();

  await expect(page.getByText("补充作品案例", { exact: true })).toBeVisible();
  await expect(page.getByText("回答校准问卷", { exact: true })).toBeVisible();
  await expect(page.getByText("纠偏分身输出", { exact: true })).toBeVisible();

  await expect(page.getByRole("region", { name: "成长轨迹与影响指标" }).getByText("预估收入（模拟）", { exact: true })).toBeVisible();
});
