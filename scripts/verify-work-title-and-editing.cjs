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

  await page.route(`${apiBase}/api/generate-music`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        output: {
          source: 'minimax_music',
          title: '海边烟火',
          status: 'done',
          duration: '3:18',
          audioUrl: `${apiBase}/api/audio/title-edit-test.mp3`,
          audioHex: '',
          prompt: 'minimax coastal firework prompt',
          message: '真实音频已生成并保存，可长期播放。',
          minimaxTraceId: 'trace-title-edit-test',
        },
      }),
    });
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('radio', { name: /极速模式/ }).click();
  await page.locator('textarea').first().fill('一首关于海边烟火和凌晨公路的歌，女声流行，像告别后独自开车回家的感觉');
  await page.getByRole('button', { name: '极速生成' }).click();
  await page.getByText('最终制作 Prompt').waitFor({ timeout: 10_000 });

  let body = await page.locator('body').innerText();
  assert(!body.includes('新歌计划'), 'generated work title should not fall back to 新歌计划 for descriptive ideas');
  assert(body.includes('海边烟火'), 'generated work title should use a recognizable phrase from the idea');

  await page.getByRole('button', { name: '编辑作品信息' }).click();
  await page.getByLabel('作品标题').fill('凌晨海岸线');
  await page.getByLabel('作品标签').fill('女声, 流行, 公路');
  await page.getByLabel('作品描述').fill('真实音频已生成，待二次精修');
  await page.getByLabel('最终歌词').fill('【主歌】\n海风吹过凌晨的路\n\n【副歌】\n我把烟火留在回忆深处');
  await page.getByLabel('最终制作 Prompt').fill('female coastal pop, midnight highway, clean vocal');
  await page.getByRole('button', { name: '保存作品信息' }).click();

  await page.getByRole('heading', { name: '凌晨海岸线' }).waitFor();
  body = await page.locator('body').innerText();
  assert(body.includes('凌晨海岸线'), 'edited title should be visible after saving');
  assert(body.includes('female coastal pop'), 'edited final prompt should be visible after saving');
  assert(body.includes('海风吹过凌晨的路'), 'edited lyrics should be visible after saving');

  await page.getByRole('main').getByRole('button', { name: '我的作品' }).click();
  await page.locator('span', { hasText: '凌晨海岸线' }).first().waitFor();

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
