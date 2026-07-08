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

  await page.getByRole('button', { name: '我的作品' }).click();
  await page.getByRole('heading', { name: '我的作品' }).waitFor();

  const editAction = page.getByRole('button', { name: '编辑作品' }).first();
  assert(await editAction.count() > 0, 'works library should show an explicit edit action');

  await editAction.click();
  await page.getByLabel('作品标题').waitFor();

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
