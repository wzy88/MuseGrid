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

  const longIdea = [
    '超长做歌想法：古风流行，中文，治愈，温暖。',
    'STEPLabel 作词 SUMMARY 以古风意象触写现代牛马差旅苦乐，从晨起出发到月下归途，落在凡间值得。',
    ...Array.from({ length: 34 }, (_, index) => (
      `第${index + 1}段：行李箱、高铁、乡村小路、山丘、串起差旅与归途叙事，保留完整段落和 JSON 字段用于模型输入。`
    )),
  ].join('\n');

  await page.locator('textarea').first().fill(longIdea);
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);

  const ideaSummary = page.locator('p').filter({ hasText: '超长做歌想法' }).first();
  assert(await ideaSummary.count() === 1, 'production sidebar should render the submitted song idea');

  const metrics = await ideaSummary.evaluate((node) => {
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
    metrics.maxHeight !== 'none' && Number.parseFloat(metrics.maxHeight) <= 260,
    `idea summary should have a bounded max-height, got ${metrics.maxHeight}`,
  );
  assert(
    metrics.overflowY === 'auto' || metrics.overflowY === 'scroll',
    `idea summary should scroll vertically, got overflow-y ${metrics.overflowY}`,
  );
  assert(
    metrics.scrollHeight > metrics.clientHeight,
    `long idea summary should have hidden overflow to scroll: ${metrics.scrollHeight} <= ${metrics.clientHeight}`,
  );
  assert(metrics.bottom < 430, `idea summary should not push the workflow down the page, bottom ${metrics.bottom}`);

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
