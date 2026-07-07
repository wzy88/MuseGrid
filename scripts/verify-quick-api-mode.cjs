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
  let stepCalls = 0;
  let musicCalls = 0;

  await page.route(`${apiBase}/api/generate-step`, async (route) => {
    stepCalls += 1;
    const payload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        output: {
          stepLabel: ['作词', '作曲', '编曲', '制作 Demo'][payload.stepIndex] || '创作',
          source: 'minimax_text',
          summary: `MiniMax 已生成 ${payload.project.title} 的第 ${payload.stepIndex + 1} 步`,
          blocks: [
            { label: 'MiniMax 测试输出', value: `第 ${payload.stepIndex + 1} 步真实链路内容` },
            { label: '分身', value: payload.avatar.name },
          ],
          lyrics: payload.stepIndex === 0 ? '【主歌】\n雨夜列车缓缓开来\n\n【副歌】\n重逢像一束旧月光' : '',
          prompt: `minimax prompt ${payload.stepIndex}`,
          confidence: 0.93,
        },
      }),
    });
  });

  await page.route(`${apiBase}/api/generate-music`, async (route) => {
    musicCalls += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        output: {
          source: 'minimax_music',
          title: '雨夜列车',
          status: 'done',
          duration: '3:12',
          audioUrl: `${apiBase}/api/audio/test.mp3`,
          audioHex: '',
          prompt: 'minimax final prompt',
          message: '真实音频已生成并保存，可长期播放。',
          minimaxTraceId: 'trace-quick-test',
        },
      }),
    });
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('radio', { name: /极速模式/ }).click();
  await page.locator('textarea').first().fill('一首关于雨夜列车和旧友重逢的歌，电子国风，带一点温柔的遗憾');
  await page.getByRole('button', { name: '极速生成' }).click();
  await page.getByText('最终制作 Prompt').waitFor({ timeout: 10_000 });

  const body = await page.locator('body').innerText();
  assert(stepCalls === 4, `quick mode should call Worker for all four creative steps, got ${stepCalls}`);
  assert(musicCalls === 1, `quick mode should call Worker music endpoint once, got ${musicCalls}`);
  assert(body.includes('真实音频'), 'quick mode result should be marked as real audio');
  assert(body.includes('3:12'), 'quick mode result should render MiniMax duration');
  assert(!body.includes('本地模拟 Demo'), 'quick mode should not present a local mock result when API is configured');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
