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
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('button', { name: '分身网络' }).click();
  await page.waitForTimeout(500);
  let body = await page.locator('body').innerText();
  assert(body.includes('浏览可召唤的创作人分身'), 'normal avatar network tab should be an unrestricted browse page');
  assert(body.includes('全部'), 'normal avatar network should show the all tab');
  assert(body.includes('作词'), 'normal avatar network should show lyric avatars');
  assert(body.includes('Ray·节奏'), 'normal avatar network should show composition avatars');
  assert(body.includes('声纹织造'), 'normal avatar network should show arrangement avatars');
  assert(body.includes('标枪小鱼'), 'normal avatar network should show production avatars');
  const mixingTabCount = await page.getByRole('button', { name: '混音' }).count();
  assert(mixingTabCount === 0, `normal avatar network should not expose unsupported mixing domain tab, got ${mixingTabCount}`);
  assert(!body.includes('当前环节只允许选择作词分身'), 'normal avatar network should not show production-step restriction copy');
  const searchInputs = await page.locator('input[placeholder*="搜索"]').count();
  assert(searchInputs === 1, `avatar network should show one search box, got ${searchInputs}`);

  await page.getByRole('button', { name: '创作台' }).click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert(!/山野清风\s+混音/.test(body), 'home recommendation network should not label an avatar as unsupported mixing domain');

  await page.locator('textarea').first().fill('一首关于雨夜列车和旧友重逢的歌，电子国风，带一点温柔的遗憾');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);

  body = await page.locator('body').innerText();
  assert(body.includes('当前环节：作词'), 'project should start at lyrics step');

  await page.getByText('换分身').click();
  await page.waitForTimeout(400);

  body = await page.locator('body').innerText();
  assert(body.includes('选择作词分身'), 'change-avatar should open the step avatar picker dialog');
  assert(!body.includes('当前环节只允许选择作词分身'), 'change-avatar should not navigate to the avatar network restriction page');
  assert(body.includes('林间小调'), 'lyrics avatar should be available');
  assert(body.includes('山野清风'), 'another lyrics avatar should be available');
  assert(!body.includes('Ray·节奏'), 'composition avatars should be hidden in lyrics step');
  assert(!body.includes('声纹织造'), 'arrangement avatars should be hidden in lyrics step');

  await page.getByTestId('avatar-picker-card-5').click();
  await page.getByTestId('avatar-picker-card-5').locator('button').click();
  await page.waitForTimeout(1200);

  body = await page.locator('body').innerText();
  assert(body.includes('当前环节：作词'), 'same-domain summon should keep the lyrics step active');
  assert(body.includes('生成的作词内容'), 'same-domain summon should generate in the current production page');
  assert(body.includes('山野清风 · Lv'), 'same-domain avatar should become the active working avatar');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
