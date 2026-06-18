import { expect, test } from "@playwright/test";

type StepDefinition = {
  stepName: string;
  generateLabel: string;
  confirmLabel: string;
};

const studioSteps: StepDefinition[] = [
  {
    stepName: "作词",
    generateLabel: "生成歌词草案",
    confirmLabel: "确认作词成果",
  },
  {
    stepName: "作曲",
    generateLabel: "生成旋律结构",
    confirmLabel: "确认作曲成果",
  },
  {
    stepName: "编曲",
    generateLabel: "生成编曲方案",
    confirmLabel: "确认编曲成果",
  },
  {
    stepName: "制作",
    generateLabel: "生成可播放 Demo",
    confirmLabel: "确认制作成果",
  },
];

test("creator completes the four-step studio flow", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("Studio Flow Tester");
  await page.getByLabel("邮箱").fill(`studio-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();

  await page.getByLabel("项目名称").fill("失重轨道");
  await page.getByLabel("歌曲灵感").fill("一首写给凌晨三点城市高架的中文电子流行，既克制又有推进感");
  await page.getByLabel("语言").fill("中文");
  await page.getByLabel("曲风").fill("电子流行");
  await page.getByLabel("情绪").fill("克制推进");
  await page.getByLabel("用途").fill("平台首发 Demo");
  await page.getByRole("button", { name: "开始制作" }).click();

  await expect(page).toHaveURL(/\/studio\/projects\/[^/]+$/);
  await expect(page.getByRole("heading", { name: "失重轨道" })).toBeVisible();
  const stepRail = page.getByRole("region", { name: "歌曲制作步骤" });
  const mobileProgress = page.locator(".studioMobileProgress");

  await expect(stepRail.getByRole("button", { name: /作曲\s*未解锁\s*搭建旋律与段落结构/ })).toBeDisabled();
  await expect(stepRail.getByRole("button", { name: /编曲\s*未解锁\s*完成配器与能量编排/ })).toBeDisabled();
  await expect(stepRail.getByRole("button", { name: /制作\s*未解锁\s*生成可播放 Demo/ })).toBeDisabled();
  await expect(mobileProgress.locator("button").nth(1)).toContainText("作曲");
  await expect(mobileProgress.locator("button").nth(1)).toContainText("未解锁");
  await expect(mobileProgress.locator("button").nth(1)).toBeDisabled();
  await expect(mobileProgress.locator("button").nth(2)).toContainText("编曲");
  await expect(mobileProgress.locator("button").nth(2)).toContainText("未解锁");
  await expect(mobileProgress.locator("button").nth(2)).toBeDisabled();
  await expect(mobileProgress.locator("button").nth(3)).toContainText("制作");
  await expect(mobileProgress.locator("button").nth(3)).toContainText("未解锁");
  await expect(mobileProgress.locator("button").nth(3)).toBeDisabled();

  for (const [index, step] of studioSteps.entries()) {
    await stepRail.getByRole("button").nth(index).click();
    const workspace = page.getByRole("region", { name: step.stepName });
    await expect(workspace.getByRole("heading", { name: step.stepName })).toBeVisible();

    const firstAvatar = page.getByRole("radio").first();
    await firstAvatar.click();
    await expect(firstAvatar).toBeChecked();
    await workspace.getByRole("button", { name: step.generateLabel, exact: true }).click();
    await expect(workspace.getByText("已生成，可继续确认")).toBeVisible();
    await workspace.getByRole("button", { name: step.confirmLabel, exact: true }).click();
    await expect(stepRail.getByRole("button").nth(index)).toContainText("已确认");

    const nextStep = studioSteps[index + 1];
    if (nextStep) {
      await expect(stepRail.getByRole("button").nth(index + 1)).toContainText(nextStep.stepName);
      await expect(stepRail.getByRole("button").nth(index + 1)).toBeEnabled();
      await expect(mobileProgress.locator("button").nth(index + 1)).toContainText(nextStep.stepName);
      await expect(mobileProgress.locator("button").nth(index + 1)).toBeEnabled();
    }
  }

  await expect(
    page.getByRole("region", { name: "制作" }).getByRole("button", { name: "生成可播放 Demo", exact: true }),
  ).toBeVisible();
});
