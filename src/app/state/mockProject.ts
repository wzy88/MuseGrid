export type PageId =
  | 'home' | 'production' | 'avatarNetwork' | 'createAvatar'
  | 'myWorks' | 'avatarManage' | 'contribution'
  | 'evolutionReport' | 'calibration';

export type StepStatus = 'pending' | 'active' | 'done';
export type WorkMode = 'choose' | 'summoning' | 'result';

export type ProjectBrief = {
  title: string;
  idea: string;
  language: string;
  genre: string;
  mood: string;
  intendedUse: string;
};

export type AvatarProfile = {
  id: number | string;
  creatorId?: string;
  name: string;
  dir: string;
  lv: number;
  level?: number;
  calls: number;
  adopt: number;
  tags: string[];
  emoji: string;
  color: string;
  motto: string;
  status: string;
  intro?: string;
  method?: string;
  avoid?: string;
  representativeWorks?: string[];
  reps?: string[];
  styleWeights?: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
};

export type AvatarCalibration = {
  id: string;
  avatarId: string | number;
  creatorId: string;
  scores: Record<string, string>;
  answers: Record<string, string>;
  parameterChanges: Array<{ key: string; delta: string | number; from?: number; to?: number; reason: string }>;
  createdAt: string;
};

export type StepMeta = {
  label: string;
  desc: string;
  weight: number;
};

export type StepState = {
  status: StepStatus;
  mode: WorkMode;
  avatarId: number | null;
  confirmed: boolean;
  revisionCount: number;
  output?: GenerationStepOutput | null;
};

export type ContributionSnapshot = {
  step: string;
  avatar: string;
  lv: number;
  w: number;
  output: string;
  edit: string;
  at: string;
  adopt: number;
};

export type GenerationBlock = {
  label: string;
  value: string;
};

export type GenerationStepOutput = {
  stepLabel: string;
  source: string;
  summary: string;
  blocks: GenerationBlock[];
  lyrics: string;
  prompt: string;
  confidence: number;
  error?: string;
};

export type GenerationMusicOutput = {
  source: string;
  title: string;
  status: string;
  duration: string;
  audioUrl: string;
  audioHex: string;
  prompt: string;
  message: string;
  minimaxTraceId: string;
};

export type GeneratedWork = {
  id: number;
  title: string;
  status: 'done' | 'active' | 'draft';
  color: string;
  tags: string[];
  seed: number;
  stepsDone: number;
  progress: number;
  desc: string;
  plays: number;
  likes: number;
  shares: number;
  completion: number;
  earnings: number;
  duration: string;
  audioUrl?: string;
  generationSource?: string;
  finalPrompt: string;
  lyrics: string;
  protocol: string;
  contribs: ContributionSnapshot[];
};

export const STEP_META: StepMeta[] = [
  { label: '作词', desc: '把灵感变成歌词方向和初稿', weight: 20 },
  { label: '作曲', desc: '基于歌词生成旋律结构和音乐走向', weight: 25 },
  { label: '编曲', desc: '确定乐器、律动和声音质感', weight: 25 },
  { label: '制作 Demo', desc: '整合所有输入，调用生成模型', weight: 20 },
];

export const AVATARS: AvatarProfile[] = [
  { id: 1, name: '林间小调', dir: '作词', lv: 4, calls: 560, adopt: 84, tags: ['古风','情感叙事'], emoji: '✍️', color: '#6366F1',
    motto: '「先找情绪转折点，再让 Hook 把故事收回来。」', status: '状态良好' },
  { id: 2, name: 'Ray·节奏', dir: '作曲', lv: 5, calls: 1240, adopt: 91, tags: ['流行','电子'], emoji: '🎼', color: '#2563EB',
    motto: '「旋律不是被写出来的，是被听出来的。」', status: '热门召唤' },
  { id: 3, name: '声纹织造', dir: '编曲', lv: 3, calls: 320, adopt: 78, tags: ['氛围感','弦乐'], emoji: '🎸', color: '#059669',
    motto: '「层次感是编曲的灵魂。」', status: '正在探索' },
  { id: 4, name: '标枪小鱼', dir: '制作', lv: 4, calls: 890, adopt: 87, tags: ['R&B','混音'], emoji: '🎚️', color: '#D97706',
    motto: '「好的制作让音乐自己开口说话。」', status: '状态良好' },
];

export function normalizeAvatar(profile: AvatarProfile): AvatarProfile {
  return {
    ...profile,
    lv: profile.lv ?? profile.level ?? 1,
    level: profile.level ?? profile.lv ?? 1,
    calls: profile.calls ?? 0,
    adopt: profile.adopt ?? 0,
    tags: profile.tags ?? [],
    emoji: profile.emoji ?? '✍️',
    color: profile.color ?? '#6366F1',
    motto: profile.motto ?? '',
    status: profile.status ?? '状态良好',
    representativeWorks: profile.representativeWorks ?? profile.reps ?? [],
    reps: profile.reps ?? profile.representativeWorks ?? [],
    styleWeights: profile.styleWeights ?? {},
  };
}

export const DEFAULT_PROJECT: ProjectBrief = {
  title: '梦中之旅',
  idea: '在迷雾中漫行的旅人，穿越山川，最终和旧日的自己和解。',
  language: '中文',
  genre: '古风流行',
  mood: '治愈·温暖',
  intendedUse: '个人创作',
};

export function createSteps(startWithResult = false): StepState[] {
  return [
    { status: 'active', mode: startWithResult ? 'result' : 'choose', avatarId: startWithResult ? 0 : null, confirmed: false, revisionCount: 0, output: null },
    { status: 'pending', mode: 'choose', avatarId: null, confirmed: false, revisionCount: 0, output: null },
    { status: 'pending', mode: 'choose', avatarId: null, confirmed: false, revisionCount: 0, output: null },
    { status: 'pending', mode: 'choose', avatarId: null, confirmed: false, revisionCount: 0, output: null },
  ];
}

export function projectTitleFromIdea(idea: string) {
  if (/雨夜|列车/.test(idea)) {
    return '雨夜列车';
  }
  if (/夏天|告别/.test(idea)) {
    return '夏末路口';
  }
  if (/城市|夜/.test(idea)) {
    return '城市夜语';
  }
  return '新歌计划';
}

export function buildProjectFromIdea(idea: string): ProjectBrief {
  const cleanIdea = idea.trim() || DEFAULT_PROJECT.idea;
  return {
    title: projectTitleFromIdea(cleanIdea),
    idea: cleanIdea,
    language: '中文',
    genre: /电子国风/.test(cleanIdea) ? '电子国风' : DEFAULT_PROJECT.genre,
    mood: /遗憾|旧友|告别/.test(cleanIdea) ? '温柔·遗憾' : DEFAULT_PROJECT.mood,
    intendedUse: DEFAULT_PROJECT.intendedUse,
  };
}

export function outputSummary(stepIndex: number, project: ProjectBrief) {
  const topic = project.title;
  const summaries = [
    `${topic}主题歌词，围绕「${project.idea.slice(0, 18)}」展开，确认 Hook 与主副歌结构`,
    `${topic}旋律方案，${project.genre}方向，主歌克制、副歌抬升，速度约 118-122 BPM`,
    `${topic}编曲方案，保留${project.genre}核心质感，加入层次推进和段落能量变化`,
    `${topic}最终制作 Prompt，人声前置，混音温暖，生成 Demo 所需信息已整理`,
  ];
  return summaries[stepIndex] ?? summaries[0];
}

export function lyricText(project: ProjectBrief) {
  if (/雨夜|列车/.test(project.idea)) {
    return `【主歌】\n雨落在旧车站的玻璃窗\n你撑着伞站在昏黄灯光\n我们把沉默说得很轻\n像怕惊醒那一段远方\n\n【副歌】\n雨夜的列车开向南方\n旧友的名字还停在心上\n如果重逢只是短暂月光\n我也愿把遗憾唱到天亮`;
  }
  return `【主歌】\n夏末的阳光还有些烫\n你说的话散落在风里\n路口的花还没谢完\n而你已经走了很远的地方\n\n【副歌】\n你走了之后 风还是那么甜\n街角的老树还在同一个位置站\n我闭上眼睛 听见你说再见\n原来告别可以这么轻\n却压在心上这么重`;
}

export function finalPrompt(project: ProjectBrief) {
  return `${project.genre}女声，${project.mood}，120BPM，古琴/合成器/弦乐/现代鼓组融合，人声清晰靠前，暖色调混音，情绪克制但副歌有记忆点。`;
}

export function createContribution(stepIndex: number, project: ProjectBrief, avatarIndex: number, revisionCount: number, output?: GenerationStepOutput | null, avatarOverride?: AvatarProfile): ContributionSnapshot {
  const meta = STEP_META[stepIndex];
  const avatar = normalizeAvatar(avatarOverride ?? AVATARS[avatarIndex]);
  return {
    step: meta.label,
    avatar: avatar.name,
    lv: avatar.lv,
    w: meta.weight,
    output: output?.summary || outputSummary(stepIndex, project),
    edit: revisionCount > 0 ? `用户提出 ${revisionCount} 轮修改意见后确认` : output?.source?.startsWith('minimax') ? '由真实模型生成后确认' : '用户未做大幅编辑，直接确认',
    at: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    adopt: Math.min(100, avatar.adopt + (revisionCount > 0 ? 4 : 8)),
  };
}

export const SAMPLE_WORKS: GeneratedWork[] = [
  { id:1, title:'山海之旅', status:'done', color:'#5B21B6', tags:['古风','流行','女声'], seed:3, stepsDone:4, progress:1, desc:'已生成 Demo · 四步完成', plays:1240, likes:89, shares:23, completion:73, earnings:8.40, duration:'3:47', finalPrompt:'古风流行女声，古琴+弦乐+现代鼓组，治愈温暖，120BPM，F大调', lyrics: lyricText(DEFAULT_PROJECT), protocol:'', contribs:[
    {step:'作词',avatar:'林间小调',lv:4,w:20,output:'夏末告别主题，古风叙事风格，确认版本 v3',edit:'用户强化了第2段主歌意象层次',at:'06-20 14:32',adopt:85},
    {step:'作曲',avatar:'Ray·节奏',lv:5,w:25,output:'120BPM 大调，主副歌旋律对比，弦乐+钢琴',edit:'用户未做编辑，直接确认',at:'06-20 15:10',adopt:100},
    {step:'编曲',avatar:'声纹织造',lv:3,w:25,output:'古琴引子+现代鼓组，verse 留白，chorus 推进',edit:'用户微调 bridge 弦乐密度',at:'06-20 16:45',adopt:78},
    {step:'制作 Demo',avatar:'标枪小鱼',lv:4,w:20,output:'暖色调混音，人声前置，整体 prompt 已生成',edit:'用户确认最终 prompt 无修改',at:'06-20 17:30',adopt:100},
  ]},
  { id:2, title:'城市夜语', status:'active', color:'#1D4ED8', tags:['都市','R&B','男声'], seed:7, stepsDone:2, progress:0.5, desc:'正在编曲 · 分身工作中', plays:0, likes:0, shares:0, completion:0, earnings:0, duration:'—', finalPrompt:'', lyrics:'', protocol:'', contribs:[] },
  { id:3, title:'繁星如故', status:'draft', color:'#065F46', tags:['民谣','治愈','女声'], seed:11, stepsDone:1, progress:0.25, desc:'作词完成 · 待作曲', plays:0, likes:0, shares:0, completion:0, earnings:0, duration:'—', finalPrompt:'', lyrics:'', protocol:'', contribs:[] },
  { id:4, title:'光年以外', status:'done', color:'#7D2E46', tags:['流行','摇滚','男声'], seed:15, stepsDone:4, progress:1, desc:'已生成 Demo · 四步完成', plays:843, likes:56, shares:14, completion:68, earnings:5.20, duration:'4:12', finalPrompt:'流行摇滚男声，吉他失真+合成器+电子鼓，激情热血，138BPM，小调', lyrics:'【主歌】\\n城市的灯光一闪一闪\\n像夜空里散落的星点\\n我站在人群最边缘\\n寻找那条回家的路线', protocol:'', contribs:[] },
];

export function generatedWorkFromProject(project: ProjectBrief, contributions: ContributionSnapshot[], musicOutput?: GenerationMusicOutput | null, stepOutputs: (GenerationStepOutput | null | undefined)[] = []): GeneratedWork {
  const lyricOutput = stepOutputs.find((output) => output?.lyrics)?.lyrics;
  const promptOutput = musicOutput?.prompt || [...stepOutputs].reverse().find((output) => output?.prompt)?.prompt;
  return {
    id: 99,
    title: project.title,
    status: 'done',
    color: '#4F46E5',
    tags: [project.genre, project.mood, project.language],
    seed: 23,
    stepsDone: 4,
    progress: 1,
    desc: '已生成 Demo · 四步完成',
    plays: 0,
    likes: 0,
    shares: 0,
    completion: 0,
    earnings: 0,
    duration: musicOutput?.duration || '3:38',
    audioUrl: musicOutput?.audioUrl || '',
    generationSource: musicOutput?.source || 'mock',
    finalPrompt: promptOutput || finalPrompt(project),
    lyrics: lyricOutput || lyricText(project),
    protocol: '',
    contribs: contributions,
  };
}
