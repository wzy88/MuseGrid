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
  await page.getByRole('button', { name: '分身网络' }).click();
  await page.waitForTimeout(500);

  const cardSummonButtons = page.getByRole('button', { name: '召唤协作' });
  assert(await cardSummonButtons.count() === 0, 'avatar cards should not repeat summon buttons');

  const selectedBadges = page.getByText('已选择');
  assert(await selectedBadges.count() >= 1, 'selected avatar card should show an obvious selected state');

  const detailPrimaryCta = page.getByRole('button', { name: '召唤当前分身' });
  assert(await detailPrimaryCta.count() === 1, 'avatar network should expose exactly one primary summon CTA');
  assert(await detailPrimaryCta.isVisible(), 'detail panel should expose a primary summon CTA near the avatar identity');

  await page.getByText('Ray·节奏').click();
  await page.waitForTimeout(200);
  const selectedRay = page.getByText('Ray·节奏 · 作曲 · 采纳 91%');
  assert(await selectedRay.isVisible(), 'clicking an avatar card should update the selected detail summary');

  await detailPrimaryCta.click();
  await page.waitForTimeout(400);
  let body = await page.locator('body').innerText();
  assert(body.includes('当前环节：作曲') || body.includes('选择作曲方式'), 'primary summon CTA should navigate into the selected avatar production step');
  assert(body.includes('来自分身网络'), 'production page should mark the selected avatar from avatar network');
  assert(body.includes('推荐：Ray·节奏'), 'production method card should use the selected avatar from avatar network');

  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.getByRole('button', { name: /召唤推荐分身/ }).first().click();
  await page.waitForTimeout(1200);
  body = await page.locator('body').innerText();
  assert(body.includes('Ray·节奏 · Lv5'), 'summoning should use the avatar selected in avatar network');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
