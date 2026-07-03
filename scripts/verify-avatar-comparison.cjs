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
  await page.getByRole('button', { name: /召唤推荐分身/ }).first().click();
  await page.waitForTimeout(1200);
  let body = await page.locator('body').innerText();
  assert(body.includes('生成的作词内容'), 'initial summon should render the lyric result');
  assert(body.includes('林间小调'), 'initial lyric result should use the recommended lyric avatar');

  await page.getByText('确认作词成果，进入下一步').click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.getByRole('button', { name: /召唤推荐分身/ }).first().click();
  await page.waitForTimeout(1200);
  body = await page.locator('body').innerText();
  assert(body.includes('生成的作曲内容'), 'composition summon should render the composition result');
  assert(body.includes('Ray·节奏'), 'composition step should use Ray as the original avatar');

  await page.getByText('选择对比分身').click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert(body.includes('选择作曲分身生成对比'), 'comparison button should open the shared avatar picker first');
  assert(body.includes('零度电子') || body.includes('霓虹动机室') || body.includes('冷拍实验室'), 'composition comparison picker should offer other composition avatars even for old snapshots');
  assert(!body.includes('当前没有其它作曲分身可对比'), 'composition comparison picker should not be empty when default composition avatars exist');
  assert(!body.includes('声纹织造 · Lv'), 'composition comparison picker should not offer arrangement avatars');
  assert(!body.includes('标枪小鱼 · Lv'), 'composition comparison picker should not offer production avatars');

  await page.getByRole('button', { name: /生成.*对比/ }).first().click();
  await page.waitForTimeout(1200);

  body = await page.locator('body').innerText();
  assert(body.includes('分身候选对比'), 'comparison mode should render a real comparison section');
  assert(body.includes('Ray·节奏 设计流行电子旋律'), 'original avatar output should remain visible');
  assert(body.includes('零度电子 用冷感电子') || body.includes('霓虹动机室 用 104 BPM') || body.includes('冷拍实验室 用 92 BPM'), 'comparison avatar output should be visible');
  assert(body.includes('采纳此版本'), 'each candidate should be selectable as the adopted version');

  await page.getByText('采纳此版本').last().click();
  await page.waitForTimeout(300);
  const selectedBody = await page.locator('body').innerText();
  assert(selectedBody.includes('零度电子 · Lv') || selectedBody.includes('霓虹动机室 · Lv') || selectedBody.includes('冷拍实验室 · Lv'), 'adopting the comparison candidate should switch the current avatar');
  assert(selectedBody.includes('Ray·节奏 设计流行电子旋律'), 'original candidate should not disappear after selecting another avatar');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
