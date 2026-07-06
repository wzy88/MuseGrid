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

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.locator('textarea').first().fill('一首古风流行，带完整歌词、结构化标签和下游 Prompt 的长内容测试歌');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.getByRole('button', { name: /召唤推荐分身/ }).first().click();
  await page.waitForTimeout(1600);

  const resultArea = page.getByTestId('step-result-scroll-area');
  assert(await resultArea.count() === 1, 'generated step result body should expose one scrollable result area');

  const resultText = await resultArea.innerText();
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
