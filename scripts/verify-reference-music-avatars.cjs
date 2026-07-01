const { chromium } = require('playwright');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4325/';

  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  const result = await page.evaluate(async () => {
    const state = await import('/src/app/state/mockProject.ts');
    const generation = await import('/src/app/data/generationClient.ts');
    const project = {
      title: '今年如此炎热的夏天',
      idea: '今年如此炎热的夏天，城市被晒到失真，人变得烦躁，却还藏着一点想念和脆弱',
      language: '中文',
      genre: '华语流行',
      mood: '燥热·想念·脆弱',
      intendedUse: '参考型分身测试',
    };
    const avatars = state.AVATARS.map(state.normalizeAvatar);
    const compositionNames = ['霓虹动机室', '旧调旋律铺', '冷拍实验室'];
    const arrangementNames = ['弦雾织造所', '热浪鼓组', '霓虹合成器'];
    const productionNames = ['贴耳人声室', '热浪低频台', '冷光母带间'];
    const compositionOutputs = compositionNames.map((name) => {
      const avatar = avatars.find((item) => item.name === name);
      return {
        name,
        avatar,
        output: avatar ? generation.createLocalStepOutput({ stepIndex: 1, project, avatar, previousContributions: [] }) : null,
      };
    });
    const arrangementOutputs = arrangementNames.map((name) => {
      const avatar = avatars.find((item) => item.name === name);
      return {
        name,
        avatar,
        output: avatar ? generation.createLocalStepOutput({ stepIndex: 2, project, avatar, previousContributions: [] }) : null,
      };
    });
    const productionOutputs = productionNames.map((name) => {
      const avatar = avatars.find((item) => item.name === name);
      return {
        name,
        avatar,
        output: avatar ? generation.createLocalStepOutput({ stepIndex: 3, project, avatar, previousContributions: [] }) : null,
      };
    });
    return { compositionOutputs, arrangementOutputs, productionOutputs };
  });

  for (const item of result.compositionOutputs) {
    assert(item.avatar, `missing composition reference avatar: ${item.name}`);
    assert(item.avatar.dir === '作曲', `${item.name} should be a composition avatar`);
    assert(item.avatar.avoid.includes('不代表本人'), `${item.name} should include non-impersonation boundary`);
    assert(item.output.summary.includes(item.name), `${item.name} output should identify the active avatar`);
  }
  for (const item of result.arrangementOutputs) {
    assert(item.avatar, `missing arrangement reference avatar: ${item.name}`);
    assert(item.avatar.dir === '编曲', `${item.name} should be an arrangement avatar`);
    assert(item.avatar.avoid.includes('不代表本人'), `${item.name} should include non-impersonation boundary`);
    assert(item.output.summary.includes(item.name), `${item.name} output should identify the active avatar`);
  }
  for (const item of result.productionOutputs) {
    assert(item.avatar, `missing production reference avatar: ${item.name}`);
    assert(item.avatar.dir === '制作', `${item.name} should be a production avatar`);
    assert(item.avatar.avoid.includes('不代表本人'), `${item.name} should include non-impersonation boundary`);
    assert(item.output.summary.includes(item.name), `${item.name} output should identify the active avatar`);
  }

  const compositionText = Object.fromEntries(result.compositionOutputs.map((item) => [item.name, `${item.output.summary}\n${item.output.blocks.map((block) => `${block.label}:${block.value}`).join('\n')}`]));
  assert(/短动机|强 Hook|104 BPM/.test(compositionText['霓虹动机室']), '霓虹动机室 should produce short-motif pop composition');
  assert(/长线|副歌上扬|76 BPM/.test(compositionText['旧调旋律铺']), '旧调旋律铺 should produce long-line ballad composition');
  assert(/冷感|循环|92 BPM/.test(compositionText['冷拍实验室']), '冷拍实验室 should produce restrained electronic composition');

  const arrangementText = Object.fromEntries(result.arrangementOutputs.map((item) => [item.name, `${item.output.summary}\n${item.output.blocks.map((block) => `${block.label}:${block.value}`).join('\n')}`]));
  assert(/弦乐|空间|电影感/.test(arrangementText['弦雾织造所']), '弦雾织造所 should produce cinematic string arrangement');
  assert(/鼓组|Bass|副歌/.test(arrangementText['热浪鼓组']), '热浪鼓组 should produce groove-forward arrangement');
  assert(/合成器|颗粒|都市/.test(arrangementText['霓虹合成器']), '霓虹合成器 should produce synth-forward arrangement');

  const productionText = Object.fromEntries(result.productionOutputs.map((item) => [item.name, `${item.output.summary}\n${item.output.blocks.map((block) => `${block.label}:${block.value}`).join('\n')}`]));
  assert(/贴耳|close mic|短 plate/.test(productionText['贴耳人声室']), '贴耳人声室 should produce intimate vocal production');
  assert(/低频|punchy bass|鼓组/.test(productionText['热浪低频台']), '热浪低频台 should produce low-end forward production');
  assert(/冷光|neon texture|颗粒/.test(productionText['冷光母带间']), '冷光母带间 should produce cold urban mastering direction');

  const printBlock = (items) => items.map((item) => {
    const blocks = item.output.blocks.map((block) => `- ${block.label}: ${block.value}`).join('\n');
    return [`## ${item.name}`, item.output.summary, blocks].join('\n');
  }).join('\n\n');
  console.log(`\n=== 作曲参考分身 ===\n${printBlock(result.compositionOutputs)}\n\n=== 编曲参考分身 ===\n${printBlock(result.arrangementOutputs)}\n\n=== 制作参考分身 ===\n${printBlock(result.productionOutputs)}`);

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
