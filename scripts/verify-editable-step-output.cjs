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

  await page.locator('textarea').first().fill('一首关于雨夜列车和旧友重逢的歌，电子国风，带一点温柔的遗憾');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);

  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
  await page.waitForTimeout(1200);

  const editor = page.getByTestId('generated-step-editor');
  assert(await editor.count() === 1, 'generated step result should expose an editable result textarea');

  const customLine = '我直接把雨夜列车改成一封没有寄出的信。';
  await editor.fill(`【用户编辑版】\n${customLine}\n副歌要更安静，像把告别藏进伞沿。`);

  const reviseButton = page.getByRole('button', { name: /继续修改/ });
  const reviseState = await reviseButton.getAttribute('data-state');
  assert(reviseState === 'ready', 'continue revision button should enter a ready state after direct edits');

  await page.getByText(/确认作词成果/).click();
  await page.waitForTimeout(400);

  for (const label of ['作曲', '编曲', '制作 Demo']) {
    await page.getByRole('button', { name: /召唤数字分身/ }).click();
    await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
    await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
    await page.waitForTimeout(1200);
    await page.getByText(new RegExp(`确认${label}成果`)).click();
    await page.waitForTimeout(400);
  }

  await page.getByRole('button', { name: '生成最终 Demo' }).click();
  await page.waitForTimeout(1600);
  await page.getByText('前往作品页收听').click();
  await page.waitForTimeout(500);

  const body = await page.locator('body').innerText();
  assert(body.includes(customLine), 'work result should use the user-edited lyric content after confirmation');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
