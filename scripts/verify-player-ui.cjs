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

  await page.getByText('我的作品', { exact: true }).click();
  await page.getByText('山海之旅', { exact: true }).click();
  await page.waitForTimeout(300);

  const workPlayButton = page.getByRole('button', { name: /播放山海之旅/ });
  assert(await workPlayButton.count() === 1, 'work detail should expose a primary play button for the current work');
  await workPlayButton.click();
  await page.waitForTimeout(200);
  const bottomTrack = await page.getByTestId('bottom-player-track-title').innerText();
  assert(bottomTrack.includes('山海之旅'), `bottom player should load the clicked work, got ${bottomTrack}`);

  const timeMetrics = await page.getByTestId('bottom-player-time').evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      scrollWidth: node.scrollWidth,
      text: node.textContent,
    };
  });
  assert(timeMetrics.height <= 18, `bottom player time should stay on one line, got height ${timeMetrics.height}`);
  assert(timeMetrics.scrollWidth <= Math.ceil(timeMetrics.width) + 1, `bottom player time should not be clipped: ${timeMetrics.text}`);

  await page.getByRole('button', { name: '播放列表' }).click();
  await page.waitForTimeout(200);
  const body = await page.locator('body').innerText();
  assert(body.includes('播放队列'), 'playlist button should open the playback queue');
  assert(body.includes('山海之旅'), 'playback queue should show available works');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
