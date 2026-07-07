const { chromium } = require('playwright');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4325/';

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    localStorage.clear();
    const state = await import('/src/app/state/mockProject.ts');
    localStorage.setItem('musegrid.v2.snapshot', JSON.stringify({
      project: state.DEFAULT_PROJECT,
      steps: state.createSteps(false),
      currentStep: 0,
      contributions: [],
      avatars: state.AVATARS.slice(0, 4),
      activeAvatarId: state.AVATARS[0].id,
      activeWorkId: null,
      updatedAt: new Date().toISOString(),
    }));
  });
  await page.reload({ waitUntil: 'networkidle' });

  await page.locator('textarea').first().fill('一首关于雨夜列车和旧友重逢的歌，电子国风，带一点温柔的遗憾');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);

  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
  await page.waitForTimeout(1200);
  let body = await page.locator('body').innerText();
  assert(body.includes('生成的作词内容'), 'initial summon should render the lyric result');
  assert(body.includes('林间小调'), 'initial lyric result should use the recommended lyric avatar');

  await page.getByText('确认作词成果，进入下一步').click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
  await page.waitForTimeout(1200);
  body = await page.locator('body').innerText();
  assert(body.includes('生成的作曲内容'), 'composition summon should render the composition result');
  assert(body.includes('Ray·节奏'), 'composition step should use Ray as the original avatar');

  const compareButton = page.getByRole('button', { name: /选择对比分身/ });
  assert(await compareButton.isDisabled(), 'comparison avatar button should stay disabled until the interaction is completed in a later version');
  body = await page.locator('body').innerText();
  assert(!body.includes('分身候选对比'), 'disabled comparison entry should not expose unfinished comparison UI');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
