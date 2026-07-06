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
          source: 'worker_test',
          summary: `Worker 已接管 ${payload.project.title} 的${payload.avatar.dir}环节`,
          blocks: [
            { label: 'Worker 测试输出', value: `来自 API 的第 ${payload.stepIndex + 1} 步内容` },
            { label: '分身', value: payload.avatar.name },
          ],
          lyrics: payload.stepIndex === 0 ? '【主歌】\nWorker 写出的歌词\n\n【副歌】\n真实接口链路已经打通' : '',
          prompt: `worker prompt ${payload.stepIndex}`,
          confidence: 0.91,
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
          source: 'worker_test',
          title: '雨夜列车',
          status: 'mock_ready',
          duration: '3:01',
          audioUrl: '',
          audioHex: '',
          prompt: 'worker final prompt',
          message: 'Worker 音乐接口已调用',
          minimaxTraceId: 'trace-test',
        },
      }),
    });
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.locator('textarea').first().fill('一首关于雨夜列车和旧友重逢的歌，电子国风，带一点温柔的遗憾');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
  await page.waitForTimeout(1200);

  let body = await page.locator('body').innerText();
  assert(stepCalls === 1, `summoning should call Worker once, got ${stepCalls}`);
  assert(/worker 测试输出/i.test(body), 'production page should render structured content returned by Worker');
  assert(body.includes('Worker 已接管 雨夜列车'), 'production page should render Worker summary');

  await page.getByText(/确认作词成果/).click();
  await page.waitForTimeout(300);

  for (const label of ['作曲', '编曲', '制作 Demo']) {
    await page.getByRole('button', { name: /召唤数字分身/ }).click();
    await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
    await page.waitForTimeout(1200);
    await page.getByText(new RegExp(`确认${label}成果`)).click();
    await page.waitForTimeout(300);
  }

  await page.getByRole('button', { name: '生成最终 Demo' }).click();
  await page.waitForTimeout(1200);
  body = await page.locator('body').innerText();
  assert(stepCalls === 4, `all four steps should call Worker, got ${stepCalls}`);
  assert(musicCalls === 1, `final Demo generation should call Worker music endpoint, got ${musicCalls}`);
  assert(body.includes('3:01'), 'generated Demo panel should show Worker duration');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
