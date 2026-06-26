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

  await page.getByRole('button', { name: '申请入驻' }).click();
  await page.waitForTimeout(400);
  await page.locator('input[placeholder="为你的分身起一个名字"]').fill('夜航写词人');
  await page.getByText('下一步').click();
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: '电子' }).click();
  await page.getByText('下一步').click();
  await page.waitForTimeout(200);
  await page.getByText('下一步').click();
  await page.waitForTimeout(200);
  await page.getByText('完成创建').click();
  await page.waitForTimeout(1200);

  let body = await page.locator('body').innerText();
  assert(body.includes('夜航写词人'), 'created avatar should appear on manage page');
  assert(body.includes('本地保存') || body.includes('状态良好'), 'created avatar should expose persistence/status');

  await page.getByRole('button', { name: '分身网络' }).click();
  await page.waitForTimeout(500);
  body = await page.locator('body').innerText();
  assert(body.includes('夜航写词人'), 'created avatar should appear in avatar network');

  await page.getByRole('button', { name: '创作台' }).click();
  await page.waitForTimeout(300);
  await page.locator('textarea').first().fill('一首关于雨夜列车和旧友重逢的歌，电子国风，温柔遗憾');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(600);
  body = await page.locator('body').innerText();
  assert(body.includes('推荐：夜航写词人 · 作词'), 'production page should recommend the user-created lyric avatar');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
