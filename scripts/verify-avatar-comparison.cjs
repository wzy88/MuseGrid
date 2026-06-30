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
  const calls = [];

  await page.route(`${apiBase}/api/generate-step`, async (route) => {
    const payload = route.request().postDataJSON();
    calls.push(payload.avatar.name);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        output: {
          stepLabel: '作词',
          source: 'worker_test',
          summary: `${payload.avatar.name} 的专属作词交付`,
          blocks: [
            { label: '分身侧重点', value: `${payload.avatar.name} 输出的独立版本` },
            { label: 'Hook 候选', value: `来自 ${payload.avatar.name} 的 Hook` },
          ],
          lyrics: `[Verse]\n${payload.avatar.name} 写出的主歌\n\n[Chorus]\n${payload.avatar.name} 写出的副歌`,
          prompt: `${payload.avatar.name} prompt`,
          confidence: payload.avatar.name.includes('林间') ? 0.82 : 0.91,
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

  await page.getByText('召唤推荐分身').click();
  await page.waitForTimeout(1200);
  assert(calls.length === 1, `initial summon should call one avatar, got ${calls.length}`);

  await page.getByText('选择对比分身').click();
  await page.waitForTimeout(300);
  let body = await page.locator('body').innerText();
  assert(calls.length === 1, `opening comparison picker should not generate immediately, got ${calls.length}`);
  assert(body.includes('选择一个分身生成对比'), 'comparison button should open an avatar picker first');
  assert(!body.includes('Ray·节奏'), 'lyrics comparison picker should not offer composition avatars');
  assert(!body.includes('声纹织造'), 'lyrics comparison picker should not offer arrangement avatars');

  await page.getByRole('button', { name: /生成对比/ }).first().click();
  await page.waitForTimeout(1200);

  body = await page.locator('body').innerText();
  assert(calls.length === 2, `comparison should generate two independent avatar outputs, got ${calls.length}`);
  assert(new Set(calls).size === 2, `comparison should use two different avatars, got ${calls.join(', ')}`);
  assert(body.includes('分身候选对比'), 'comparison mode should render a real comparison section');
  assert(body.includes(`${calls[0]} 的专属作词交付`), 'original avatar output should remain visible');
  assert(body.includes(`${calls[1]} 的专属作词交付`), 'comparison avatar output should be visible');
  assert(body.includes('采纳此版本'), 'each candidate should be selectable as the adopted version');

  await page.getByText('采纳此版本').last().click();
  await page.waitForTimeout(300);
  const selectedBody = await page.locator('body').innerText();
  assert(selectedBody.includes(`${calls[1]} · Lv`), 'adopting the comparison candidate should switch the current avatar');
  assert(selectedBody.includes(`${calls[0]} 的专属作词交付`), 'original candidate should not disappear after selecting another avatar');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
