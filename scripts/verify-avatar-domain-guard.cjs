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
  assert(!body.includes('当前环节只允许选择作词分身'), 'normal avatar network should not show production-step restriction copy');
  const searchInputs = await page.locator('input[placeholder*="搜索"]').count();
  assert(searchInputs === 1, `avatar network should show one search box, got ${searchInputs}`);

  await page.getByRole('button', { name: '创作台' }).click();
  await page.waitForTimeout(300);

  await page.locator('textarea').first().fill('一首关于雨夜列车和旧友重逢的歌，电子国风，带一点温柔的遗憾');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);

  body = await page.locator('body').innerText();
  assert(body.includes('当前环节：作词'), 'project should start at lyrics step');

  await page.getByText('换分身').click();
  await page.waitForTimeout(400);

  body = await page.locator('body').innerText();
  assert(body.includes('当前环节只允许选择作词分身'), 'avatar network should explain the current domain restriction');
  assert(body.includes('林间小调'), 'lyrics avatar should be available');
  assert(body.includes('山野清风'), 'another lyrics avatar should be available');
  assert(!body.includes('Ray·节奏'), 'composition avatars should be hidden in lyrics step');
  assert(!body.includes('声纹织造'), 'arrangement avatars should be hidden in lyrics step');

  await page.getByText('山野清风', { exact: true }).click();
  await page.getByText('召唤当前分身').click();
  await page.waitForTimeout(600);

  body = await page.locator('body').innerText();
  assert(body.includes('当前环节：作词'), 'same-domain summon should keep the lyrics step active');
  assert(body.includes('推荐：山野清风 · 作词'), 'same-domain avatar should be carried back to the production step');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
