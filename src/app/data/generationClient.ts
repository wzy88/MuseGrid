import {
  AVATARS,
  STEP_META,
  buildCombinationStyleSignature,
  buildStepStyleSignature,
  finalPrompt,
  lyricText,
  outputSummary,
  type AvatarProfile,
  type ContributionSnapshot,
  type GenerationMusicOutput,
  type GenerationStepOutput,
  type ProjectBrief,
} from '../state/mockProject';

export type GenerateStepInput = {
  stepIndex: number;
  project: ProjectBrief;
  avatar: AvatarProfile;
  previousContributions: ContributionSnapshot[];
  feedback?: string;
  revisionCount?: number;
};

export type GenerateMusicInput = {
  project: ProjectBrief;
  contributions: ContributionSnapshot[];
  stepOutputs: (GenerationStepOutput | null | undefined)[];
};

function apiBase() {
  return (import.meta.env.VITE_MUSEGRID_API_BASE as string | undefined)?.replace(/\/$/, '').trim();
}

export function hasGenerationApi() {
  return Boolean(apiBase());
}

function avatarBlock(avatar: AvatarProfile) {
  return [
    { label: '分身方法', value: avatar.method || avatar.motto || '按当前项目上下文生成。' },
    { label: '边界提醒', value: avatar.avoid || '避免和当前方向无关的风格漂移。' },
  ];
}

function avatarConfidence(avatar: AvatarProfile, revised: boolean) {
  return Math.min(0.96, Math.max(0.68, avatar.adopt / 100 + (revised ? 0.04 : 0.01)));
}

function lyricOutputForAvatar(project: ProjectBrief, avatar: AvatarProfile) {
  if (avatar.name === '青瓷山房') {
    const lyrics = `[Verse]\n雨沿着旧站檐角慢慢落下\n青色车票压在你掌心发凉\n远处汽笛像一枚未干的印章\n把重逢盖回那条潮湿长廊\n\n[Chorus]\n我借一盏灯 看你眉眼如瓷\n一别多年 风还押着旧时的字\n列车穿过夜 把月色折成诗\n你没说留下 我也不敢先启齿`;
    return {
      summary: `${avatar.name} 采用器物意象和韵脚组织，把「${project.title}」写成雨站、车票、灯影构成的中国风场景。`,
      blocks: [
        { label: '主题理解', value: `先抓住车票、站檐、灯影这些可触摸的器物，再让${project.mood}从物件里慢慢浮出来。` },
        { label: 'Hook 候选', value: '我借一盏灯 看你眉眼如瓷 / 列车穿过夜 把月色折成诗' },
        { label: '歌词口味', value: '画面密度高，韵脚清楚，用器物承载时间，不直接说破遗憾。' },
        ...avatarBlock(avatar),
      ],
      lyrics,
    };
  }

  if (avatar.name === '木夕未眠') {
    const lyrics = `[Verse]\n你说好久不见 像一句礼貌的谎\n我点头 才发现自己也很擅长\n雨把窗外擦亮 也把我们擦伤\n越靠近的人 越像隔着一面墙\n\n[Chorus]\n如果重逢只是为了证明失去\n我宁愿把拥抱留在下一秒之前\n你问我这些年有没有忘记\n我说忘记 本身就是一种纪念`;
    return {
      summary: `${avatar.name} 采用心理悖论和留白写法，把「${project.title}」写成重逢时无法承认的暗流。`,
      blocks: [
        { label: '主题理解', value: `重点不是列车，而是两个人都在假装平静；让${project.mood}藏在回答和停顿里。` },
        { label: 'Hook 候选', value: '忘记 本身就是一种纪念 / 重逢只是为了证明失去' },
        { label: '歌词口味', value: '少用大场面，多写心理转折；句子平静，但每句都带第二层意思。' },
        ...avatarBlock(avatar),
      ],
      lyrics,
    };
  }

  if (avatar.name === '山丘旁白') {
    const lyrics = `[Verse]\n那天雨很大 车站人很多\n你笑着说 这些年你也还不错\n我想问的话 在嘴边坐了很久\n最后只说 路上小心 别再淋着\n\n[Chorus]\n我们都过了非要答案的年纪\n有些人见一面 就算把账还清\n如果当年我懂得好好说一句\n也许今晚不用笑着装作没关系`;
    return {
      summary: `${avatar.name} 采用口语白描和人生回望，把「${project.title}」写成普通人多年后才说出口的遗憾。`,
      blocks: [
        { label: '主题理解', value: `不追求漂亮句子，先把人到某个年纪才会承认的后悔写实；${project.mood}来自话没说尽。` },
        { label: 'Hook 候选', value: '我们都过了非要答案的年纪 / 有些人见一面 就算把账还清' },
        { label: '歌词口味', value: '口语、白描、克制，像一个人终于愿意把半生说得简单一点。' },
        ...avatarBlock(avatar),
      ],
      lyrics,
    };
  }

  if (avatar.name === '山野清风') {
    const lyrics = `[Verse]\n旧站牌还站在雨里\n你把伞往我这边移\n有些话没有说完\n就跟着晚风低下去\n\n[Chorus]\n夏末的路口 你赠我清秀\n我把想念唱得很轻很久\n不问后来往哪里走\n只记得你来过这个时候`;
    return {
      summary: `${avatar.name} 采用民谣口语写法，把「${project.title}」写成低声告别和自然意象。`,
      blocks: [
        { label: '主题理解', value: `少写概念，多写伞、站牌、晚风这些能看见的细节，保留${project.mood}。` },
        { label: 'Hook 候选', value: '夏末的路口 你赠我清秀 / 我把想念唱得很轻很久' },
        { label: '歌词口味', value: '短句、留白、民谣叙事，不追求华丽转折。' },
        ...avatarBlock(avatar),
      ],
      lyrics,
    };
  }

  const lyrics = `[Verse]\n蝉声落进长亭晚风\n长街尽处 见你执伞\n汗水泪湿的衣角\n像那年 你写给我的信\n\n[Pre-Chorus]\n路灯一盏一盏亮起\n两道影子越拉越长\n有些话还没开口\n已经学会了温柔地藏\n\n[Chorus]\n夏末的路口 你赠我温柔\n热浪退去 晚风正好\n折一枝杨柳 唱你清秀\n让这个夏天 不算太短`;
  return {
    summary: `${avatar.name} 以古风流行的情绪转折写法，把「${project.title}」收束成可复唱 Hook。`,
    blocks: [
      { label: '主题理解', value: `围绕「${project.idea}」建立热中取静、告别后回望的叙事线。` },
      { label: 'Hook 候选', value: '夏末的路口 你赠我温柔 / 折一枝杨柳 唱你清秀' },
      { label: '歌词口味', value: '主歌铺画面，Pre-Chorus 转情绪，副歌用古风意象回收主题。' },
      ...avatarBlock(avatar),
    ],
    lyrics,
  };
}

function compositionBlocksForAvatar(project: ProjectBrief, avatar: AvatarProfile) {
  if (avatar.name === '零度电子') {
    return {
      summary: `${avatar.name} 用冷感电子 motif 处理「${project.title}」，主歌克制，副歌靠合成器纹理记忆。`,
      blocks: [
        { label: '调性/速度', value: 'E 小调，96 BPM，半拍律动，保留冷感空间。' },
        { label: '核心动机', value: '2 小节合成器短音型反复变形，副歌不大喊但更锋利。' },
        { label: '段落设计', value: 'Intro motif → Verse 低位 → Chorus 叠八度 synth → Bridge 降噪抽离。' },
        ...avatarBlock(avatar),
      ],
      prompt: `${project.genre}, cold electronic motif, E minor, 96 BPM, synth texture, restrained chorus`,
    };
  }
  return {
    summary: `${avatar.name} 设计流行电子旋律，副歌五度跃升形成直接记忆点。`,
    blocks: [
      { label: '调性/速度', value: 'D 大调转 B 小调，72 BPM，三拍子与四拍子交替段落。' },
      { label: '旋律走向', value: '主歌级进呢喃，副歌跳进释放，落音归宫音稳固中式听觉记忆。' },
      { label: 'Hook 设计', value: '副歌首句四度跳进上行，尾音长音延留形成甜点。' },
      ...avatarBlock(avatar),
    ],
    prompt: `${project.genre}, warm pop melody, memorable chorus leap, 72 BPM, pentatonic color`,
  };
}

function arrangementBlocksForAvatar(project: ProjectBrief, avatar: AvatarProfile) {
  if (avatar.name === '织夜鼓组') {
    return {
      summary: `${avatar.name} 以鼓组和 bass 推动段落，让「${project.title}」副歌进入更有门槛感。`,
      blocks: [
        { label: '鼓组推进', value: 'Verse 轻 kick + rim，Pre 加拍手，Chorus 全鼓进入并加低频推进。' },
        { label: 'Bass 设计', value: '副歌根音八分推进，Bridge 切掉低频制造回落。' },
        { label: '过门策略', value: '每段只用一次短 fill，避免鼓点抢词。' },
        ...avatarBlock(avatar),
      ],
      prompt: `${project.genre}, groove-driven arrangement, tight drums, bass movement, chorus lift`,
    };
  }
  return {
    summary: `${avatar.name} 用弦乐和 pad 搭建空间，让旋律有电影化层次。`,
    blocks: [
      { label: '乐器配置', value: '古琴点题，钢琴铺底，弦乐 Pad 拉空间，人声和声只在副歌后半进入。' },
      { label: '段落推进', value: 'Intro 留白，Verse 保持空间，Chorus 全编进入，Bridge 抽离后再爆发。' },
      { label: '声音质感', value: '中频温暖，高频空气感，避免装饰音抢走歌词。' },
      ...avatarBlock(avatar),
    ],
    prompt: `${project.genre}, atmospheric strings, pad layers, cinematic but vocal-forward arrangement`,
  };
}

function productionBlocksForAvatar(project: ProjectBrief, avatar: AvatarProfile) {
  if (avatar.name === '暖声工坊') {
    return {
      summary: `${avatar.name} 把制作重点放在人声亲密度、温暖母带和柔和空间。`,
      blocks: [
        { label: '人声质感', value: '近距离女声，轻压缩，soft saturation，齿音控制。' },
        { label: '空间策略', value: '短 plate reverb + 低比例 delay，保留歌词可懂度。' },
        { label: '母带倾向', value: '温暖、不刺耳，中频靠前，响度适中。' },
        ...avatarBlock(avatar),
      ],
      prompt: `${project.genre}, intimate vocal, warm master, soft saturation, controlled sibilance, gentle room`,
    };
  }
  return {
    summary: `${avatar.name} 整合 R&B 人声、低频控制和可执行音乐模型 Prompt。`,
    blocks: [
      { label: '最终制作 Prompt', value: `${project.genre}，${project.mood}，人声前置，低频收紧，副歌有记忆点。` },
      { label: '人声质感', value: '温暖女声，略带气声，真诚感优先。' },
      { label: '混音倾向', value: '中频饱满，低频干净，高频清透但不刺耳。' },
      ...avatarBlock(avatar),
    ],
    prompt: `${project.genre}, ${project.mood}, R&B vocal polish, clean low end, warm mix, catchy chorus`,
  };
}

export function createLocalStepOutput(input: GenerateStepInput): GenerationStepOutput {
  const { stepIndex, project } = input;
  const avatar = input.avatar;
  const revised = (input.revisionCount ?? 0) > 0 || Boolean(input.feedback?.trim());
  const styleSignature = buildStepStyleSignature({
    stepIndex,
    project,
    avatar,
    previousContributions: input.previousContributions,
  });

  if (stepIndex === 0) {
    const lyric = lyricOutputForAvatar(project, avatar);
    return {
      stepLabel: STEP_META[stepIndex].label,
      source: 'local_mock',
      summary: lyric.summary,
      blocks: lyric.blocks,
      lyrics: lyric.lyrics,
      prompt: '',
      confidence: avatarConfidence(avatar, revised),
      styleSignature,
    };
  }

  if (stepIndex === 1) {
    const composition = compositionBlocksForAvatar(project, avatar);
    return {
      stepLabel: STEP_META[stepIndex].label,
      source: 'local_mock',
      summary: composition.summary,
      blocks: composition.blocks,
      lyrics: '',
      prompt: `${composition.prompt}, ${styleSignature.promptTraits.join(', ')}`,
      confidence: avatarConfidence(avatar, revised),
      styleSignature,
    };
  }

  if (stepIndex === 2) {
    const arrangement = arrangementBlocksForAvatar(project, avatar);
    return {
      stepLabel: STEP_META[stepIndex].label,
      source: 'local_mock',
      summary: arrangement.summary,
      blocks: arrangement.blocks,
      lyrics: '',
      prompt: `${arrangement.prompt}, ${styleSignature.promptTraits.join(', ')}`,
      confidence: avatarConfidence(avatar, revised),
      styleSignature,
    };
  }

  const production = productionBlocksForAvatar(project, avatar);
  return {
    stepLabel: STEP_META[stepIndex].label,
    source: 'local_mock',
    summary: production.summary,
    blocks: production.blocks,
    lyrics: '',
    prompt: `${production.prompt}, ${styleSignature.headline}, ${styleSignature.promptTraits.join(', ')}`,
    confidence: avatarConfidence(avatar, revised),
    styleSignature,
  };
}

export function createLocalMusicOutput(input: GenerateMusicInput): GenerationMusicOutput {
  const combinationSignature = buildCombinationStyleSignature(input.contributions);
  const promptBase = [...input.stepOutputs].reverse().find((output) => output?.prompt)?.prompt || finalPrompt(input.project);
  const prompt = combinationSignature.promptTraits.length
    ? `${promptBase}。组合风格指纹：${combinationSignature.headline}；${combinationSignature.promptTraits.join('、')}。`
    : promptBase;
  return {
    source: 'local_mock',
    title: input.project.title,
    status: 'mock_ready',
    duration: '3:38',
    audioUrl: '',
    audioHex: '',
    prompt,
    message: '本地模拟 Demo 已生成。接入 Worker 和 MiniMax 后会返回真实音频。',
    minimaxTraceId: '',
  };
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const base = apiBase();
  if (!base) {
    throw new Error('未配置生成 API');
  }

  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json() as { ok?: boolean; output?: T; error?: string };
  if (!response.ok || !data.ok || !data.output) {
    throw new Error(data.error || `生成 API 返回 ${response.status}`);
  }
  return data.output;
}

export async function generateStep(input: GenerateStepInput): Promise<GenerationStepOutput> {
  if (!hasGenerationApi()) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return createLocalStepOutput(input);
  }
  return postJson<GenerationStepOutput>('/api/generate-step', input);
}

export async function generateMusic(input: GenerateMusicInput): Promise<GenerationMusicOutput> {
  if (!hasGenerationApi()) {
    await new Promise((resolve) => setTimeout(resolve, 900));
    return createLocalMusicOutput(input);
  }
  return postJson<GenerationMusicOutput>('/api/generate-music', {
    ...input,
    lyrics: input.stepOutputs.find((output) => output?.lyrics)?.lyrics || lyricText(input.project),
    prompt: [...input.stepOutputs].reverse().find((output) => output?.prompt)?.prompt || finalPrompt(input.project),
    avatars: AVATARS,
  });
}
