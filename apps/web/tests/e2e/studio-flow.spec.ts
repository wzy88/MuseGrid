import { expect, test } from "@playwright/test";

type StepDefinition = {
  stepName: string;
  generateLabel: string;
  confirmLabel: string;
};

const studioSteps: StepDefinition[] = [
  {
    stepName: "作词",
    generateLabel: "召唤他作词",
    confirmLabel: "确认作词成果，进入作曲",
  },
  {
    stepName: "作曲",
    generateLabel: "召唤他作曲",
    confirmLabel: "确认作曲成果，进入编曲",
  },
  {
    stepName: "编曲",
    generateLabel: "召唤他编曲",
    confirmLabel: "确认编曲成果，进入制作",
  },
  {
    stepName: "制作",
    generateLabel: "召唤他制作",
    confirmLabel: "确认制作成果，生成 Demo",
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
  await expect(page.getByRole("heading", { name: "确认并进入下一步" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "生成状态栏" })).toHaveCount(0);
  const stepRail = page.getByRole("region", { name: "歌曲制作步骤" });
  const mobileProgress = page.locator(".studioMobileProgress");

  await expect(stepRail.getByRole("button", { name: /作曲\s*未解锁/ })).toBeDisabled();
  await expect(stepRail.getByRole("button", { name: /编曲\s*未解锁/ })).toBeDisabled();
  await expect(stepRail.getByRole("button", { name: /制作\s*未解锁/ })).toBeDisabled();
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

    await workspace.getByRole("radio", { name: /召唤创作人分身/ }).click();
    const firstAvatar = workspace.getByRole("radiogroup", { name: "创作人分身选择器" }).getByRole("radio").first();
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
    page.getByRole("region", { name: "制作" }).getByRole("heading", { name: "Demo Player" }),
  ).toBeVisible({ timeout: 15000 });
});

test("creator can write a step without summoning and keep a lightweight contribution record", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("Self Write Tester");
  await page.getByLabel("邮箱").fill(`self-write-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();

  await page.getByLabel("项目名称").fill("本人写入");
  await page.getByLabel("歌曲灵感").fill("一首由用户先写歌词，再召唤后续创作人完成的中文电子流行。");
  await page.getByLabel("语言").fill("中文");
  await page.getByLabel("曲风").fill("电子流行");
  await page.getByLabel("情绪").fill("清醒上升");
  await page.getByLabel("用途").fill("产品流程验证");
  await page.getByRole("button", { name: "开始制作" }).click();

  await expect(page).toHaveURL(/\/studio\/projects\/[^/]+$/);
  const workspace = page.getByRole("region", { name: "作词" });
  await workspace.getByRole("radio", { name: /自己写/ }).click();
  await workspace.getByLabel("歌词内容").fill("我把第一句写给醒来的城市\n把副歌留给下一次相遇");
  await workspace.getByRole("button", { name: "确认作词成果，进入作曲", exact: true }).click();

  const stepRail = page.getByRole("region", { name: "歌曲制作步骤" });
  await expect(stepRail.getByRole("button").nth(0)).toContainText("已确认");
  await expect(stepRail.getByRole("button").nth(1)).toBeEnabled();
  await expect(page.getByRole("status", { name: "创作记录状态" })).toContainText("贡献记录 1/4");
  await expect(page.getByRole("list", { name: "Contribution Chain" })).toHaveCount(0);
});

test("creator can request avatar revisions before confirming a generated step", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("名称").fill("Revision Tester");
  await page.getByLabel("邮箱").fill(`revision-${Date.now()}@musegrid.local`);
  await page.getByLabel("密码").fill("musegrid-pass-123");
  await page.getByRole("button", { name: "创建账户" }).click();

  await page.getByLabel("项目名称").fill("反复打磨");
  await page.getByLabel("歌曲灵感").fill("一首需要多轮修改副歌的中文电子流行。");
  await page.getByLabel("语言").fill("中文");
  await page.getByLabel("曲风").fill("电子流行");
  await page.getByLabel("情绪").fill("克制推进");
  await page.getByLabel("用途").fill("产品流程验证");
  await page.getByRole("button", { name: "开始制作" }).click();

  const workspace = page.getByRole("region", { name: "作词" });
  await workspace.getByRole("radio", { name: /召唤创作人分身/ }).click();
  const firstAvatar = workspace.getByRole("radiogroup", { name: "创作人分身选择器" }).getByRole("radio").first();
  await firstAvatar.click();
  await workspace.getByRole("button", { name: "召唤他作词", exact: true }).click();
  await expect(workspace.getByRole("heading", { name: /交付了一版草案/ })).toBeVisible();
  await expect(workspace.getByText("满意后再确认进入下一步。")).toBeVisible();

  await workspace.getByLabel("修改意见").fill("副歌更口语一点，保留夜航感。");
  await workspace.getByRole("button", { name: "让分身继续修改", exact: true }).click();

  await expect(workspace.getByText("已根据修改意见生成新版本，可继续修改或确认。")).toBeVisible();
  await expect(workspace.getByLabel("草案内容")).toContainText("副歌更口语一点");
  await expect(page.getByRole("region", { name: "歌曲制作步骤" }).getByRole("button").nth(1)).toBeDisabled();
});
