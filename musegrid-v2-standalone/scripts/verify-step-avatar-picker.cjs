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

  await page.locator('textarea').first().fill('一首关于今年炎热夏天的歌，想念、烦躁但温柔');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);

  let body = await page.locator('body').innerText();
  assert(body.includes('选择作词方式'), 'lyrics step should ask the user to choose a creation method first');
  assert(body.includes('召唤数字分身'), 'lyrics step should offer avatar-assisted generation as a method');
  assert(body.includes('自己来写'), 'lyrics step should offer manual writing as a method');
  assert(!body.includes('青瓷山房 · Lv'), 'lyrics avatars should not be laid out directly on the main workflow page');
  assert(!body.includes('Ray·节奏 · Lv'), 'lyrics picker should not expose composition avatars');

  await page.getByRole('button', { name: /自己来写/ }).click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert(body.includes('手写的作词内容'), 'manual method should open a writable lyrics draft instead of doing nothing');
  assert(await page.locator('textarea[placeholder*="写下完整歌词"]').isVisible(), 'manual lyrics draft should provide an editor');

  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('textarea').first().fill('一首关于今年炎热夏天的歌，想念、烦躁但温柔');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(400);

  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert(body.includes('选择作词分身'), 'avatar method should open the step avatar picker dialog');
  assert(await page.locator('input[placeholder="搜索分身或风格"]').isVisible(), 'avatar picker should provide search');
  assert(body.includes('排序：推荐'), 'avatar picker should provide sorting');
  assert(body.includes('全部标签'), 'avatar picker should provide tag filtering');
  for (const name of ['林间小调', '山野清风', '青瓷山房']) {
    assert(body.includes(name), `lyrics picker should expose ${name}`);
  }
  assert(!body.includes('Ray·节奏 · Lv'), 'lyrics picker dialog should not expose composition avatars');

  await page.getByTestId('avatar-picker-card-5').click();
  await page.getByTestId('avatar-picker-card-5').locator('button').click();
  await page.waitForTimeout(1200);
  body = await page.locator('body').innerText();
  assert(body.includes('生成的作词内容'), 'summoning a non-default lyric avatar should generate lyrics');
  assert(body.includes('山野清风 · Lv'), 'selected lyric avatar should become the active working avatar');
  assert(body.includes('山野清风 采用民谣口语写法'), 'selected lyric avatar should drive the output content');

  await page.getByText('确认作词成果，进入下一步').click();
  await page.waitForTimeout(400);
  body = await page.locator('body').innerText();
  assert(body.includes('选择作曲方式'), 'composition step should ask for a creation method first');
  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert(body.includes('选择作曲分身'), 'composition step should open the avatar picker dialog');
  for (const name of ['Ray·节奏', '霓虹动机室', '冷拍实验室']) {
    assert(body.includes(name), `composition picker should expose ${name}`);
  }
  assert(!body.includes('声纹织造 · Lv'), 'composition picker should not expose arrangement avatars');

  await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
  await page.waitForTimeout(1200);
  await page.getByText('确认作曲成果，进入下一步').click();
  await page.waitForTimeout(400);
  body = await page.locator('body').innerText();
  assert(body.includes('选择编曲方式'), 'arrangement step should ask for a creation method first');
  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert(body.includes('选择编曲分身'), 'arrangement step should open the avatar picker dialog');
  for (const name of ['声纹织造', '弦雾织造所', '热浪鼓组']) {
    assert(body.includes(name), `arrangement picker should expose ${name}`);
  }
  assert(!body.includes('标枪小鱼 · Lv'), 'arrangement picker should not expose production avatars');

  await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
  await page.waitForTimeout(1200);
  await page.getByText('确认编曲成果，进入下一步').click();
  await page.waitForTimeout(400);
  body = await page.locator('body').innerText();
  assert(body.includes('选择制作 Demo方式'), 'production step should ask for a creation method first');
  await page.getByRole('button', { name: /召唤数字分身/ }).click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert(body.includes('选择制作分身'), 'production step should open the avatar picker dialog');
  for (const name of ['标枪小鱼', '贴耳人声室', '冷光母带间']) {
    assert(body.includes(name), `production picker should expose ${name}`);
  }
  assert(!body.includes('林间小调 · Lv'), 'production picker should not expose lyric avatars');

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
