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

  assert(
    await page.getByPlaceholder('搜索项目、分身…').count() === 0,
    'top bar should not expose a global search input until global search is implemented',
  );

  await page.getByRole('button', { name: '分身网络' }).click();
  await page.waitForTimeout(400);
  assert(
    await page.getByRole('button', { name: '筛选' }).count() === 0,
    'avatar network should not expose a decorative filter button',
  );

  const avatarSearch = page.getByPlaceholder('搜索分身或风格…');
  await avatarSearch.fill('Ray');
  await page.waitForTimeout(200);
  assert(
    (await page.locator('body').innerText()).includes('共 1 位创作人分身'),
    'avatar network search should actually filter the visible avatar count',
  );

  await page.getByRole('button', { name: '贡献链路' }).click();
  await page.waitForTimeout(400);
  assert(
    await page.getByText('全部时间').count() === 0,
    'contribution page should not expose a decorative time filter',
  );

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
