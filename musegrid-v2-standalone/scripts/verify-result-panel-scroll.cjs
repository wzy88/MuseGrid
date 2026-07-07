const { chromium } = require('playwright');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4325/';

  await page.route('**/api/generate-step', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        output: {
          stepLabel: '作词',
          source: 'worker_mock',
          summary: 'Worker 生成了一版包含结构化标签、完整歌词和下游 Prompt 的长作词结果，用于验证整块结果区域滚动。',
          blocks: [
            { label: '主题意象', value: '行李箱 / 高铁 / 异乡灯火 / 月亮 / 山丘，串起差旅与归途双线。' },
            { label: '情绪曲线', value: '疲惫 → 孤独 → 被牵挂 → 自愈 → 向上，副歌保留温柔但不滥情。' },
            { label: '语言风格', value: '古风短句为骨，掺入工单、手机、泡面等现代词，器物般立住再让情感流过。' },
            { label: '下游 Prompt', value: 'Chinese gufeng pop, warm healing vocal, travel imagery, cinematic strings, modern folk percussion, emotional chorus, clean mix, long lyric structure, gentle but forward motion.' },
          ],
          lyrics: [
            '【主歌A1】',
            '晨光未醒 行李碾过石板路',
            '一封工单 一张票 又是千里步',
            '高铁穿山过云雾 故乡落在身后',
            '手机亮起一句「路上注意」红了眼眶',
            '',
            '【主歌A2】',
            '酒店灯白 窗后是陌生街道',
            '泡面热气 暖不了空的胃',
            '电话接了一通又一通',
            '月落在键盘上 问我累不累',
            '',
            '【副歌】',
            '山也有山与田 也有花和月',
            '赶路的人啊 打着谁的伞',
            '愿这人间 值得你满身风尘',
            '把苦唱轻 把梦唱圆',
            '',
            '【桥段】',
            '若有一天 回到旧山前',
            '把没说出口的话 都交给炊烟',
            '你看岁月不是亏欠',
            '是把远方 慢慢写成明天',
            '',
            '【尾声】',
            '我把行李放在月光边',
            '也把疲惫 还给昨夜',
          ].join('\n'),
          prompt: 'Chinese gufeng pop, warm healing, complete lyrics, cinematic folk arrangement',
          confidence: 0.91,
        },
      }),
    });
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.locator('textarea').first().fill('一首古风流行，带完整歌词、结构化标签和下游 Prompt 的长内容测试歌');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
  await page.waitForTimeout(1600);

  const resultArea = page.getByTestId('step-result-scroll-area');
  assert(await resultArea.count() === 1, 'generated step result body should expose one scrollable result area');

  const resultText = await page.getByTestId('generated-step-editor').inputValue();
  assert(resultText.includes('MiniMax') || resultText.includes('本地体验生成') || resultText.includes('Worker'), 'result area should contain the generated summary block');
  assert(resultText.includes('完整歌词'), 'result area should contain the complete lyrics block inside the same scroll area');

  const metrics = await resultArea.evaluate((node) => {
    const style = window.getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      clientHeight: node.clientHeight,
      maxHeight: style.maxHeight,
      overflowY: style.overflowY,
      scrollHeight: node.scrollHeight,
      top: rect.top,
      bottom: rect.bottom,
    };
  });

  assert(
    metrics.maxHeight !== 'none' && Number.parseFloat(metrics.maxHeight) <= 620,
    `result area should have a bounded max-height, got ${metrics.maxHeight}`,
  );
  assert(
    metrics.overflowY === 'auto' || metrics.overflowY === 'scroll',
    `result area should scroll vertically, got overflow-y ${metrics.overflowY}`,
  );
  assert(
    metrics.scrollHeight > metrics.clientHeight,
    `result area should keep overflow inside itself: ${metrics.scrollHeight} <= ${metrics.clientHeight}`,
  );
  assert(metrics.bottom < 900, `result area should leave controls visible below it, bottom ${metrics.bottom}`);

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
