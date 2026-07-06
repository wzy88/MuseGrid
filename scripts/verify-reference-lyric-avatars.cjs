const { chromium } = require('playwright');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runAvatarTrial(page, avatarName) {
  await page.getByRole('button', { name: '创作台' }).click();
  await page.locator('textarea').first().fill('一首关于雨夜列车、旧友重逢、温柔遗憾的歌');
  await page.getByText('开始制作', { exact: true }).click();
  await page.waitForTimeout(350);

  await page.getByText('换分身').click();
  await page.waitForTimeout(350);
  await page.locator('input[placeholder="搜索分身或风格"]').fill(avatarName);
  await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
  await page.waitForTimeout(900);
  const body = await page.locator('body').innerText();
  assert(body.includes(`${avatarName} · Lv`), `${avatarName} should be the active lyric avatar`);
  return body;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4325/';
  const names = ['青瓷山房', '木夕未眠', '山丘旁白'];

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByRole('button', { name: '分身网络' }).click();
  await page.waitForTimeout(500);
  let body = await page.locator('body').innerText();
  for (const name of names) {
    assert(body.includes(name), `avatar network should include ${name}`);
  }
  for (const realName of ['方文山', '林夕', '李宗盛']) {
    assert(!body.includes(realName), `avatar network should not expose real creator name: ${realName}`);
  }

  const outputs = {};
  for (const name of names) {
    outputs[name] = await runAvatarTrial(page, name);
  }

  assert(/青瓷山房[\s\S]*意象|青瓷山房[\s\S]*器物|青瓷山房[\s\S]*韵脚/.test(outputs['青瓷山房']), '青瓷山房 should show image-and-rhyme oriented output');
  assert(/木夕未眠[\s\S]*心理|木夕未眠[\s\S]*悖论|木夕未眠[\s\S]*留白/.test(outputs['木夕未眠']), '木夕未眠 should show introspective output');
  assert(/山丘旁白[\s\S]*口语|山丘旁白[\s\S]*人生|山丘旁白[\s\S]*白描/.test(outputs['山丘旁白']), '山丘旁白 should show plainspoken life-narrative output');

  const snippets = names.map((name) => {
    const lines = outputs[name].split('\n');
    const summaryLine = lines.find((line) => line.includes(`${name} `) && /写成|采用|把/.test(line)) ?? lines.find((line) => line.includes(name)) ?? '';
    const hookIndex = lines.findIndex((line) => line.includes('Hook 候选'));
    const hookLine = hookIndex >= 0 ? lines.slice(hookIndex, hookIndex + 2).join(' ') : '';
    return [`## ${name}`, summaryLine, hookLine].join('\n');
  });
  console.log(snippets.join('\n\n'));

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
