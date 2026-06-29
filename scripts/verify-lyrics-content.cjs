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
  const apiBase = process.env.VITE_MUSEGRID_API_BASE || 'http://127.0.0.1:8787';
  const lyrics = [
    '[Verse]',
    '完整第一行歌词',
    '完整第二行歌词',
    '',
    '[Pre-Chorus]',
    '完整预副歌内容',
    '',
    '[Chorus]',
    '完整副歌第一句',
    '完整副歌第二句',
    '',
    '[Bridge]',
    '完整桥段结尾',
  ].join('\n');

  await page.route(`${apiBase}/api/generate-step`, async (route) => {
    const payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        output: {
          stepLabel: '作词',
          source: 'worker_test',
          summary: 'Worker 返回了完整歌词字段',
          blocks: [
            { label: '主题理解', value: '测试主题理解' },
            { label: '主歌', value: '[Verse]\n只是一小段预览' },
          ],
          lyrics: payload.stepIndex === 0 ? lyrics : '',
          prompt: 'worker prompt',
          confidence: 0.91,
        },
      }),
    });
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.locator('textarea').first().fill('一首关于雨夜列车和旧友重逢的歌');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);
  await page.getByText('召唤推荐分身').click();
  await page.waitForTimeout(1200);

  const fullLyricsPanel = page.getByText('完整歌词', { exact: true }).last().locator('..');
  await fullLyricsPanel.scrollIntoViewIfNeeded();
  const panelText = await fullLyricsPanel.innerText();

  assert(panelText.includes('[Bridge]'), 'complete lyrics panel should include the bridge section');
  assert(panelText.includes('完整桥段结尾'), 'complete lyrics panel should render the end of the lyrics, not only a preview block');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
