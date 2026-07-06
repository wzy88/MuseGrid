const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function verifyDataModel() {
  const state = await import('../src/app/state/mockProject.ts');
  const project = state.DEFAULT_PROJECT;
  const avatars = state.AVATARS.map(state.normalizeAvatar);

  const chainA = [avatars[0], avatars[1], avatars[2], avatars[3]];
  const chainB = [avatars[4], avatars[5], avatars[6], avatars[7]];
  assert.equal(typeof state.buildStepStyleSignature, 'function', 'mockProject should export buildStepStyleSignature');
  assert.equal(typeof state.buildCombinationStyleSignature, 'function', 'mockProject should export buildCombinationStyleSignature');

  const makeChain = (chain) => {
    const contributions = [];
    chain.forEach((avatar, stepIndex) => {
      const styleSignature = state.buildStepStyleSignature({
        stepIndex,
        project,
        avatar,
        previousContributions: contributions,
      });
      const output = {
        stepLabel: state.STEP_META[stepIndex].label,
        source: 'test',
        summary: `${avatar.name} test`,
        blocks: [],
        lyrics: '',
        prompt: '',
        confidence: 0.9,
        styleSignature,
      };
      contributions.push(state.createContribution(stepIndex, project, avatars.findIndex((item) => item.id === avatar.id), 0, output, avatar));
    });
    return state.buildCombinationStyleSignature(contributions);
  };

  const signatureA = makeChain(chainA);
  const signatureB = makeChain(chainB);

  assert.notDeepEqual(signatureA.dimensions, signatureB.dimensions, 'different avatar chains should produce different final dimensions');
  assert.notEqual(signatureA.headline, signatureB.headline, 'different avatar chains should have different signature headlines');
  assert.ok(signatureA.tags.length >= 3, 'combination signature should expose readable style tags');
  assert.ok(signatureA.downstreamImpact.includes('制作'), 'combination signature should describe production impact');
}

async function verifyUi() {
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
  await page.waitForTimeout(1000);
  let body = await page.locator('body').innerText();
  assert.ok(body.includes('风格指纹'), 'step result should expose style fingerprint');

  await page.getByText('选择对比分身').click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().click();
  await page.locator('[data-testid^="avatar-picker-card-"]').first().locator('button').click();
  await page.waitForTimeout(1000);
  body = await page.locator('body').innerText();
  assert.ok(body.includes('对后续影响'), 'candidate comparison should explain downstream impact');

  await page.getByText(/确认作词成果/).click();
  await page.waitForTimeout(300);
  body = await page.locator('body').innerText();
  assert.ok(body.includes('当前组合画像'), 'production page should show the current combination profile after a step is confirmed');
  assert.ok(body.includes('作曲将继承'), 'next step panel should say which signature it will inherit');

  await browser.close();
}

(async () => {
  await verifyDataModel();
  await verifyUi();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
