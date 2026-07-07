const { chromium } = require('playwright');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleMessages = [];
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4325/';

  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      consoleMessages.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    consoleMessages.push(`pageerror: ${error.message}`);
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('radio', { name: /专业模式/ }).waitFor();
  await page.getByRole('radio', { name: /极速模式/ }).waitFor();

  let body = await page.locator('body').innerText();
  assert(body.includes('当前模式：专业模式'), 'home page should default to professional mode');
  assert(body.includes('白盒工作流'), 'professional mode status should be visible');
  assert(body.includes('开始制作'), 'professional mode should keep the existing start action visible');

  await page.getByRole('radio', { name: /极速模式/ }).click();
  await page.waitForTimeout(150);
  body = await page.locator('body').innerText();
  assert(body.includes('当前模式：极速模式'), 'clicking quick mode should update the visible status');
  assert(body.includes('快速出草案'), 'quick mode badge should be visible');
  assert(body.includes('极速生成'), 'quick mode should update the primary action');
  assert(await page.getByRole('radio', { name: /极速模式/ }).getAttribute('aria-checked') === 'true', 'quick mode radio should be selected');

  await page.getByRole('radio', { name: /专业模式/ }).click();
  await page.waitForTimeout(150);
  body = await page.locator('body').innerText();
  assert(body.includes('当前模式：专业模式'), 'clicking professional mode should update status back');
  assert(await page.getByRole('radio', { name: /专业模式/ }).getAttribute('aria-checked') === 'true', 'professional mode radio should be selected');

  await page.getByRole('radio', { name: /极速模式/ }).click();
  await page.locator('textarea').first().fill('一首关于雨夜列车和旧友重逢的歌，电子国风，带一点温柔的遗憾');
  await page.getByRole('button', { name: '极速生成' }).click();
  await page.waitForTimeout(500);
  body = await page.locator('body').innerText();
  assert(body.includes('雨夜列车'), 'quick mode should create a finished work from the idea');
  assert(body.includes('最终制作 Prompt'), 'quick mode should open the generated work result');
  assert(body.includes('贡献链路'), 'quick mode should expose the generated contribution chain');
  assert(!body.includes('选择作词方式'), 'quick mode should not enter the professional step picker');
  assert(!body.includes('召唤数字分身'), 'quick mode should not ask users to summon avatars');

  assert(consoleMessages.length === 0, `console should be clean:\n${consoleMessages.join('\n')}`);
  await browser.close();
})().catch(async (error) => {
  console.error(error.message);
  process.exit(1);
});
