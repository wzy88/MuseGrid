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

  const idea = '一首关于雨夜列车和旧友重逢的歌，电子国风，带一点温柔的遗憾';
  await page.locator('textarea').first().fill(idea);
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);

  let body = await page.locator('body').innerText();
  assert(body.includes('雨夜列车'), 'production page should carry the home idea into project summary');
  assert(body.includes('选择作词方式'), 'production page should start from method selection, not a pre-generated result');

  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
  await page.waitForTimeout(2200);
  body = await page.locator('body').innerText();
  assert(body.includes('生成的作词内容'), 'summoning should produce the lyrics result');

  await page.getByText(/确认作词成果/).click();
  await page.waitForTimeout(400);
  body = await page.locator('body').innerText();
  assert(body.includes('当前环节：作曲'), 'confirming lyrics should move to composition');
  assert(body.includes('已确认 · 20%权重'), 'confirmed lyrics should update the contribution chain');

  for (const label of ['作曲', '编曲', '制作 Demo']) {
    await page.getByRole('button', { name: /召唤数字分身/ }).click();
    await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
    await page.waitForTimeout(2200);
    await page.getByText(new RegExp(`确认${label}成果`)).click();
    await page.waitForTimeout(500);
  }

  body = await page.locator('body').innerText();
  assert(body.includes('生成最终 Demo'), 'after four confirmations the page should offer final Demo generation');
  await page.getByRole('button', { name: '生成最终 Demo' }).click();
  await page.waitForTimeout(3400);
  body = await page.locator('body').innerText();
  assert(body.includes('Demo 已生成'), 'Demo generation should show the generated state');

  await page.getByText('前往作品页收听').click();
  await page.waitForTimeout(500);
  body = await page.locator('body').innerText();
  assert(body.includes('雨夜列车'), 'newly generated work should appear in My Works');
  assert(body.includes('贡献链路'), 'work result should expose contribution chain');
  assert(body.includes('最终制作 Prompt'), 'work result should expose generated prompt and lyrics');

  await page.getByText('召唤发行分身').click();
  await page.waitForTimeout(500);
  body = await page.locator('body').innerText();
  assert(body.includes('雨夜列车'), 'contribution page should keep the newly generated work selected');
  assert(body.includes('贡献证据链完整'), 'contribution page should show the completed evidence chain');
  assert(body.includes('林间小调（作词）'), 'contribution page should show avatar revenue split from generated contributions');

  assert(consoleMessages.length === 0, `console should be clean:\n${consoleMessages.join('\n')}`);
  await browser.close();
})().catch(async (error) => {
  console.error(error.message);
  process.exit(1);
});
