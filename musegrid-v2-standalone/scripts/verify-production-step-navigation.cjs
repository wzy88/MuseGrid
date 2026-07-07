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

  await page.locator('textarea').first().fill('一首关于旧友重逢和夏夜列车的歌');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);

  async function summonFirstAvatar() {
    await page.getByRole('button', { name: /召唤数字分身/ }).click();
    await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
    await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
    await page.waitForTimeout(1400);
  }

  await summonFirstAvatar();
  let body = await page.locator('body').innerText();
  assert(body.includes('调整当前版本'), 'generated result should show the adjustment panel');
  assert(body.includes('流程导航'), 'generated result should show the navigation panel');

  await page.getByRole('button', { name: '返回上一步' }).click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert(body.includes('选择作词方式'), 'returning should go back to the current step method selection');
  assert(!body.includes('流程导航'), 'returning should hide result navigation until a result is generated again');

  await summonFirstAvatar();
  await page.getByRole('button', { name: '跳过修改' }).click();
  await page.waitForTimeout(500);
  body = await page.locator('body').innerText();
  assert(body.includes('当前环节：作曲'), 'skipping modifications should adopt the current result and move to the next step');
  assert(body.includes('已确认 · 20%权重'), 'skipping modifications should still record the confirmed contribution');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
