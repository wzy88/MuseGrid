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

  await page.locator('textarea').first().fill('一首关于雨夜列车和旧友重逢的歌');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /召唤推荐分身/ }).first().click();
  await page.waitForTimeout(1200);

  const fullLyricsPanel = page.getByTestId('lyric-block-完整歌词');
  await fullLyricsPanel.scrollIntoViewIfNeeded();
  const panelText = await fullLyricsPanel.innerText();
  const panelBox = await fullLyricsPanel.boundingBox();
  const panelStyle = await fullLyricsPanel.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return {
      height: style.height,
      maxHeight: style.maxHeight,
      minHeight: style.minHeight,
      overflowY: style.overflowY,
    };
  });

  assert(panelText.includes('完整歌词'), 'complete lyrics panel should keep a clear title');
  assert(panelStyle.overflowY !== 'auto' && panelStyle.overflowY !== 'scroll', `complete lyrics panel should not create an inner scrollbar, got ${panelStyle.overflowY}`);
  assert(panelStyle.maxHeight === 'none', `complete lyrics panel should not clamp content with max-height, got ${panelStyle.maxHeight}`);
  assert(panelStyle.height !== '300px', 'complete lyrics panel should not use the previous fixed reading-window height');
  assert(panelBox && panelBox.height >= 260, `complete lyrics panel should render as normal page content, got ${panelBox?.height ?? 0}px`);
  assert(panelText.includes('[Chorus]'), 'complete lyrics panel should include the chorus section');
  assert(panelText.includes('让这个夏天 不算太短'), 'complete lyrics panel should render the end of the lyrics, not only a preview block');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
