const { chromium } = require('playwright');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4325/';
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  await page.getByRole('button', { name: '我的作品' }).click();
  await page.getByText('山海之旅', { exact: true }).first().click();

  const cover = page.getByTestId('work-cover-image');
  assert(await cover.isVisible(), 'work detail should show a real cover image');

  const statusBox = await page.getByTestId('work-status-badge').boundingBox();
  assert(statusBox, 'work detail should expose a measurable status badge');
  assert(statusBox.width > statusBox.height, `status badge should stay horizontal, got ${statusBox.width}x${statusBox.height}`);
  assert(statusBox.height <= 28, `status badge should stay compact, got ${statusBox.height}px high`);

  await page.getByRole('button', { name: '编辑作品' }).click();
  assert(await page.getByRole('heading', { name: '编辑歌曲信息' }).isVisible(), 'edit action should open the song information page');

  const titleInput = page.getByLabel('歌曲名称');
  assert(await titleInput.inputValue() === '山海之旅', 'edit page should load the current song title');
  await titleInput.fill('   ');
  await page.getByRole('button', { name: '保存修改' }).click();
  assert(await page.getByText('请输入歌曲名称', { exact: true }).isVisible(), 'blank song title should show an inline validation error');

  await titleInput.fill('  山海新声  ');
  await page.getByRole('button', { name: '保存修改' }).click();
  assert(await page.getByRole('heading', { name: '山海新声', exact: true }).isVisible(), 'saved title should appear on the work detail page');

  await page.getByRole('button', { name: '编辑作品' }).click();
  await titleInput.fill('不应保存的名称');
  await page.getByRole('button', { name: '取消' }).click();
  assert(await page.getByRole('heading', { name: '山海新声', exact: true }).isVisible(), 'cancel should return without changing the title');

  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('button', { name: '我的作品' }).click();
  await page.getByText('山海新声', { exact: true }).first().click();
  assert(await page.getByRole('heading', { name: '山海新声', exact: true }).isVisible(), 'saved title should persist after reload');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
