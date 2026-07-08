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
  await page.addInitScript(() => window.localStorage.clear());

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '分身网络' }).click();
  await page.waitForTimeout(500);

  const cardSummonButtons = page.getByRole('button', { name: '召唤协作' });
  assert(await cardSummonButtons.count() === 0, 'avatar cards should not repeat summon buttons');

  const selectedBadges = page.getByText('已选择');
  assert(await selectedBadges.count() >= 1, 'selected avatar card should show an obvious selected state');

  const globalSummonCta = page.getByRole('button', { name: /召唤.*分身/ });
  assert(await globalSummonCta.count() === 0, 'global avatar network should not expose a summon CTA without a production step context');
  assert(await page.getByText('分身档案预览').isVisible(), 'global avatar network should present the selected avatar as a read-only profile');
  assert(await page.getByRole('button', { name: '前往创作台选择环节' }).isVisible(), 'global avatar network should guide users back to production instead of summoning directly');

  await page.getByText('Ray·节奏').click();
  await page.waitForTimeout(200);
  const selectedRay = page.getByText('Ray·节奏 · 作曲 · 采纳 91%');
  assert(await selectedRay.isVisible(), 'clicking an avatar card should update the selected detail summary');

  await page.getByRole('button', { name: '前往创作台选择环节' }).click();
  await page.waitForTimeout(300);
  let body = await page.locator('body').innerText();
  assert(body.includes('当前环节：作词') || body.includes('选择作词方式'), 'global avatar network should return to production without forcing a mismatched step');

  await page.getByRole('button', { name: '到分身网络挑选' }).click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert(body.includes('当前环节只允许选择作词分身'), 'step-scoped avatar network should explain the active step constraint');
  assert(body.includes('林间小调 · 作词 · 采纳 84%'), 'step-scoped avatar network should select a matching avatar by default');
  const detailPrimaryCta = page.getByRole('button', { name: '召唤作词分身' });
  assert(await detailPrimaryCta.count() === 1, 'step-scoped avatar network should expose one contextual summon CTA');

  await detailPrimaryCta.click();
  await page.waitForTimeout(400);
  body = await page.locator('body').innerText();
  assert(body.includes('当前环节：作词') || body.includes('选择作词方式'), 'contextual summon CTA should return to the active production step');
  assert(body.includes('来自分身网络'), 'production page should mark the selected avatar from avatar network');
  assert(body.includes('推荐：林间小调'), 'production method card should use the selected avatar from avatar network');

  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
  await page.waitForTimeout(1200);
  body = await page.locator('body').innerText();
  assert(body.includes('林间小调 · Lv4'), 'summoning should use the avatar selected in avatar network');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
