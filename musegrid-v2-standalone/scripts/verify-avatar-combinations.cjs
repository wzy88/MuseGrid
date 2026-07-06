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
      intendedUse: '分身组合对比测试',
    };
    const avatars = state.AVATARS.map(state.normalizeAvatar);
    const combinations = [
      {
        id: 'A',
        name: '现实热浪流行',
        intent: '普通人生活里的炎热夏天，口语、低频、副歌冲击。',
        avatarNames: ['山丘旁白', '旧调旋律铺', '热浪鼓组', '热浪低频台'],
      },
      {
        id: 'B',
        name: '都市冷感电子',
        intent: '空调房、玻璃、霓虹、失眠，把热浪反写成冷感都市病。',
        avatarNames: ['木夕未眠', '冷拍实验室', '霓虹合成器', '冷光母带间'],
      },
      {
        id: 'C',
        name: '中国风热夏',
        intent: '器物意象和古典画面，但旋律抓耳，人声贴近。',
        avatarNames: ['青瓷山房', '霓虹动机室', '弦雾织造所', '贴耳人声室'],
      },
    ];

    return combinations.map((combo) => {
      const contributions = [];
      const stepOutputs = [];
      const steps = combo.avatarNames.map((avatarName, stepIndex) => {
        const avatarIndex = avatars.findIndex((item) => item.name === avatarName);
        const avatar = avatars[avatarIndex];
        const output = generation.createLocalStepOutput({
          stepIndex,
          project,
          avatar,
          previousContributions: contributions,
        });
        const contribution = state.createContribution(stepIndex, project, avatarIndex, 0, output, avatar);
        contributions.push(contribution);
        stepOutputs.push(output);
        return {
          step: state.STEP_META[stepIndex].label,
          avatarName,
          avatarDir: avatar?.dir,
          summary: output.summary,
          blocks: output.blocks,
          lyrics: output.lyrics,
          prompt: output.prompt,
          styleHeadline: output.styleSignature?.headline ?? '',
        };
      });
      const musicOutput = generation.createLocalMusicOutput({ project, contributions, stepOutputs });
      const combinationSignature = state.buildCombinationStyleSignature(contributions);
      return {
        ...combo,
        steps,
        finalPrompt: musicOutput.prompt,
        combinationHeadline: combinationSignature.headline,
        combinationTags: combinationSignature.tags,
      };
    });
  });

  assert(result.length === 3, `expected three combinations, got ${result.length}`);
  const finalPrompts = new Set(result.map((combo) => combo.finalPrompt));
  assert(finalPrompts.size === 3, 'each combination should produce a distinct final prompt');

  const byId = Object.fromEntries(result.map((combo) => [combo.id, combo]));
  assert(/口语白描|人生回望|低频|punchy bass|鼓组/.test(JSON.stringify(byId.A)), 'Combination A should read as grounded heatwave pop');
  assert(/心理悖论|冷感|合成器|cold urban|颗粒/.test(JSON.stringify(byId.B)), 'Combination B should read as cold urban electronic');
  assert(/器物意象|韵脚|弦乐|close mic|贴耳/.test(JSON.stringify(byId.C)), 'Combination C should read as Chinese imagery with intimate vocal');

  for (const combo of result) {
    const dirs = combo.steps.map((step) => step.avatarDir).join('/');
    assert(dirs === '作词/作曲/编曲/制作', `${combo.name} should follow lyric/composition/arrangement/production, got ${dirs}`);
  }

  const blockForStep = (step) => {
    const mainBlocks = step.blocks
      .filter((block) => !['分身方法', '边界提醒'].includes(block.label))
      .map((block) => `  - ${block.label}: ${block.value}`)
      .join('\n');
    const lyric = step.lyrics ? `\n  - 歌词片段:\n${step.lyrics.split('\n').slice(0, 10).map((line) => `    ${line}`).join('\n')}` : '';
    return `### ${step.step}｜${step.avatarName}\n${step.summary}\n${mainBlocks}${lyric}`;
  };

  const report = result.map((combo) => [
    `# 组合 ${combo.id}｜${combo.name}`,
    combo.intent,
    `组合画像：${combo.combinationHeadline}`,
    `组合标签：${combo.combinationTags.join(' / ')}`,
    ...combo.steps.map(blockForStep),
    `### 最终 Demo Prompt\n${combo.finalPrompt}`,
  ].join('\n\n')).join('\n\n---\n\n');

  console.log(report);

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
