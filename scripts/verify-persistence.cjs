const { chromium } = require('playwright');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function completeSong(page) {
  const idea = '一首关于雨夜列车和旧友重逢的歌，电子国风，带一点温柔的遗憾';
  await page.locator('textarea').first().fill(idea);
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);

  for (const label of ['作词', '作曲', '编曲', '制作 Demo']) {
    await page.getByRole('button', { name: /召唤数字分身/ }).click();
    await page.getByRole('button', { name: /召唤推荐分身/ }).first().click();
    await page.waitForTimeout(2200);
    await page.getByText(new RegExp(`确认${label}成果`)).click();
    await page.waitForTimeout(500);
  }

  await page.getByRole('button', { name: '生成最终 Demo' }).click();
  await page.waitForTimeout(3400);
  await page.getByText('前往作品页收听').click();
  await page.waitForTimeout(500);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4325/';

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await completeSong(page);
  let body = await page.locator('body').innerText();
  assert(body.includes('雨夜列车'), 'generated work should appear before reload');

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  body = await page.locator('body').innerText();
  assert(body.includes('雨夜列车'), 'generated work should persist after reload');

  await page.getByText('贡献链路').first().click();
  await page.waitForTimeout(500);
  body = await page.locator('body').innerText();
  assert(body.includes('雨夜列车'), 'contribution page should restore active generated work');
  assert(body.includes('贡献证据链完整'), 'persisted contribution chain should remain complete');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
