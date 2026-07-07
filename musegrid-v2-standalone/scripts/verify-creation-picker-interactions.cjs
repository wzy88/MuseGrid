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

  await page.getByLabel('语言').selectOption('粤语');
  await page.getByLabel('风格').selectOption('电子国风');
  await page.getByLabel('情绪').selectOption('克制·遗憾');
  await page.getByLabel('用途').selectOption('短视频发布');
  await page.locator('textarea').first().fill('写一首关于夏夜城市和旧友重逢的歌');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);

  let body = await page.locator('body').innerText();
  assert(body.includes('电子国风 · 粤语 · 克制·遗憾'), 'project sidebar should reflect selected dropdown values');
  assert(!body.includes('本步贡献将记录为'), 'right rail should not show contribution recording before an avatar is summoned or manual writing starts');

  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert(body.includes('选择作词分身'), 'summon method should open the avatar picker dialog');

  const porcelainCard = page.locator('[data-testid="avatar-picker-card-9"]');
  const porcelainButton = page.getByRole('button', { name: /召唤青瓷山房/ });
  await assert(await porcelainButton.isDisabled(), 'avatar summon button should be disabled until its card is selected');
  await porcelainCard.click();
  await page.waitForTimeout(200);
  body = await page.locator('body').innerText();
  assert(body.includes('已选中'), 'selected avatar card should expose a visible selected badge');
  assert(!body.includes('生成的作词内容'), 'selecting an avatar card should not immediately generate step output');
  await assert(!(await porcelainButton.isDisabled()), 'selected avatar summon button should become enabled');
  await porcelainButton.click();
  await page.waitForTimeout(1200);
  body = await page.locator('body').innerText();
  assert(body.includes('生成的作词内容'), 'selected avatar should generate the step output after clicking its enabled button');
  assert(body.includes('青瓷山房 · Lv'), 'selected avatar should become the active working avatar');

  await page.getByText('换分身').click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert(body.includes('选择作词分身'), 'right side change-avatar action should reopen the step picker dialog');
  assert(!body.includes('当前环节只允许选择作词分身'), 'change-avatar action should not navigate to the avatar network page');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
