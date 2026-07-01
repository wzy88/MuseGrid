export type PageId =
  | 'home' | 'production' | 'avatarNetwork' | 'createAvatar'
  | 'myWorks' | 'avatarManage' | 'contribution' | 'billing'
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
  selectedCandidateId?: string | null;
  candidates?: StepCandidate[];
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
  styleSignature?: StyleSignature;
};

export type GenerationBlock = {
  label: string;
  value: string;
};

export type StyleDimension = {
  key: string;
  label: string;
  value: number;
  text: string;
};

export type StyleSignature = {
  headline: string;
  tags: string[];
  dimensions: StyleDimension[];
  downstreamImpact: string;
  promptTraits: string[];
};

export type GenerationStepOutput = {
  stepLabel: string;
  source: string;
  summary: string;
  blocks: GenerationBlock[];
  lyrics: string;
  prompt: string;
  confidence: number;
  styleSignature?: StyleSignature;
  error?: string;
};

export type StepCandidate = {
  id: string;
  avatarIndex: number;
  avatarId: string | number;
  avatarName: string;
  avatarLevel: number;
  avatarColor: string;
  avatarTags: string[];
  avatarMotto: string;
  output: GenerationStepOutput;
  revisionCount: number;
  createdAt: string;
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
  id: number | string;
  creatorId?: string;
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
  shareUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const STEP_META: StepMeta[] = [
  { label: '作词', desc: '把灵感变成歌词方向和初稿', weight: 20 },
  { label: '作曲', desc: '基于歌词生成旋律结构和音乐走向', weight: 25 },
  { label: '编曲', desc: '确定乐器、律动和声音质感', weight: 25 },
  { label: '制作 Demo', desc: '整合所有输入，调用生成模型', weight: 20 },
];

export const AVATARS: AvatarProfile[] = [
  { id: 1, name: '林间小调', dir: '作词', lv: 4, calls: 560, adopt: 84, tags: ['古风','情感叙事'], emoji: '✍️', color: '#6366F1',
    motto: '「先找情绪转折点，再让 Hook 把故事收回来。」', status: '状态良好',
    intro: '擅长把普通故事写成有古风余韵的中文流行歌词，重视情绪转折和副歌收束。',
    method: '先提炼一个可反复出现的核心意象，再用主歌铺画面，Pre-Chorus 做情绪转弯，Chorus 用一句可记忆 Hook 收回主题。',
    avoid: '避免堆砌辞藻、说唱密集押韵、过长歌词行和过度玄幻设定。',
    representativeWorks: ['夏末路口', '山海之旅', '繁星如故'],
    styleWeights: { 古风: 0.86, 情感叙事: 0.9, Hook: 0.82, 画面感: 0.78 } },
  { id: 2, name: 'Ray·节奏', dir: '作曲', lv: 5, calls: 1240, adopt: 91, tags: ['流行','电子'], emoji: '🎼', color: '#2563EB',
    motto: '「旋律不是被写出来的，是被听出来的。」', status: '热门召唤',
    intro: '偏流行电子旋律设计，擅长快速找到副歌上扬点和短视频可记忆动机。',
    method: '先定 BPM 与调性，再设计 2 小节核心 motif；主歌保留低位级进，副歌用跳进或节奏切分制造记忆点。',
    avoid: '避免纯古典长旋律、无节拍自由吟唱和过度复杂转调。',
    representativeWorks: ['霓虹都市', '电子曙光', '节拍森林'],
    styleWeights: { 流行: 0.9, 电子: 0.84, Hook旋律: 0.92, 节奏切分: 0.8 } },
  { id: 3, name: '声纹织造', dir: '编曲', lv: 3, calls: 320, adopt: 78, tags: ['氛围感','弦乐'], emoji: '🎸', color: '#059669',
    motto: '「层次感是编曲的灵魂。」', status: '正在探索',
    intro: '偏氛围与弦乐层次，适合把旋律扩展成有空间感的电影化流行编曲。',
    method: '先确定主副歌能量曲线，再用 pad 和弦乐做底色，副歌增加和声与高频纹理，Bridge 做抽离。',
    avoid: '避免重金属墙、过密鼓组、抢人声的高频装饰。',
    representativeWorks: ['星际漂流', '晨雾之境'],
    styleWeights: { 氛围: 0.88, 弦乐: 0.84, 空间感: 0.86, 人声留白: 0.74 } },
  { id: 4, name: '标枪小鱼', dir: '制作', lv: 4, calls: 890, adopt: 87, tags: ['R&B','混音'], emoji: '🎚️', color: '#D97706',
    motto: '「好的制作让音乐自己开口说话。」', status: '状态良好',
    intro: '偏 R&B 与人声混音，擅长把 Demo 整理成可生成音乐模型的清晰 prompt。',
    method: '先锁定人声位置和低频密度，再整理音色、空间、动态和发布语境，输出紧凑可执行的制作 prompt。',
    avoid: '避免低频糊、人声后置、混响过深和提示词堆满互相冲突的风格。',
    representativeWorks: ['暖色调', '夜深话', '城市夜语'],
    styleWeights: { 人声: 0.9, RnB: 0.82, 混音清晰度: 0.88, 低频控制: 0.76 } },
  { id: 5, name: '山野清风', dir: '作词', lv: 3, calls: 245, adopt: 74, tags: ['民谣','自然意象'], emoji: '🌿', color: '#14532D',
    motto: '「好的歌词像呼吸，自然且必要。」', status: '需要维护',
    intro: '偏民谣和口语叙事，擅长把情绪写得朴素、短句、像真实的人在说话。',
    method: '先删掉抽象形容词，只保留能看见的动作和物件；主歌用日常细节，副歌用一句低声重复的口语。',
    avoid: '避免华丽古风词、复杂典故、强电子赛博意象和夸张口号式 Hook。',
    representativeWorks: ['林中漫步', '山间雨', '旧伞'],
    styleWeights: { 民谣: 0.9, 自然意象: 0.86, 口语: 0.82, 留白: 0.8 } },
  { id: 6, name: '零度电子', dir: '作曲', lv: 4, calls: 670, adopt: 82, tags: ['电子','实验'], emoji: '⚡', color: '#1E3A5F',
    motto: '「把不可能的声音变成可能。」', status: '状态良好',
    intro: '偏实验电子与冷感旋律，适合更未来、更锋利、更有合成器质感的作曲方案。',
    method: '先做节奏骨架和音色动机，再用短音型反复变形；副歌不一定大开，但要有冷峻的记忆纹理。',
    avoid: '避免传统民乐铺陈、甜美大歌副歌和过度温暖的钢琴叙事。',
    representativeWorks: ['量子涟漪', '零度之境', '蓝色噪声'],
    styleWeights: { 电子: 0.92, 实验: 0.82, 合成器: 0.86, 冷感: 0.78 } },
  { id: 7, name: '织夜鼓组', dir: '编曲', lv: 4, calls: 410, adopt: 81, tags: ['鼓组','层次推进'], emoji: '🥁', color: '#7C2D12',
    motto: '「每一次进入副歌，都应该有被推开的门。」', status: '状态良好',
    intro: '偏节奏与段落推进，擅长让主歌、副歌、Bridge 的能量层次清楚可听。',
    method: '先画鼓组进入表，再安排 bass、拍手、过门和反拍装饰；每段只新增一两个关键元素。',
    avoid: '避免全程满编、鼓点抢词、无意义 crash 和过度切碎的电子打击。',
    representativeWorks: ['地下月台', '反拍夏夜', '桥下回声'],
    styleWeights: { 鼓组: 0.9, 层次推进: 0.86, Bass: 0.78, 副歌爆发: 0.82 } },
  { id: 8, name: '暖声工坊', dir: '制作', lv: 3, calls: 520, adopt: 79, tags: ['人声','母带'], emoji: '🎛️', color: '#7C3AED',
    motto: '「制作不是加东西，是让情绪站到前面。」', status: '状态良好',
    intro: '偏人声质感、母带响度和温暖空间，适合治愈、民谣、抒情流行。',
    method: '先确定人声亲密度，再压缩动态和空间尾巴；最终 prompt 强调 vocal intimate、soft saturation、warm master。',
    avoid: '避免过亮齿音、过度压缩、低频轰鸣和冷硬工业质感。',
    representativeWorks: ['晚灯', '小房间', '风过窗台'],
    styleWeights: { 人声亲密度: 0.9, 母带: 0.78, 温暖: 0.86, 空间控制: 0.82 } },
  { id: 9, name: '青瓷山房', dir: '作词', lv: 4, calls: 0, adopt: 86, tags: ['中国风','器物意象'], emoji: '🏺', color: '#0F766E',
    motto: '「先让一件器物站住，再让时间从它身上流过去。」', status: '参考型 · 可被召唤',
    intro: '基于公开作品与访谈整理出的中国风作词方法论分身，重视器物、场景、韵脚和时空纵深。',
    method: '先选一个可触摸的核心器物，再配季节、地名、颜色和动作；主歌铺画面，副歌用短句回钩，韵脚保持清晰但不硬押。',
    avoid: '不代表本人，不复刻原词，不使用真实署名做召唤入口；避免堆砌古词、照搬名作句式和空泛东方符号。',
    representativeWorks: ['青瓷雨巷', '旧镇烟火', '月下碑文'],
    styleWeights: { 中国风: 0.9, 器物意象: 0.88, 韵脚: 0.82, 时空感: 0.84 } },
  { id: 10, name: '木夕未眠', dir: '作词', lv: 4, calls: 0, adopt: 85, tags: ['哲思情歌','心理转折'], emoji: '🌘', color: '#7E22CE',
    motto: '「越轻的句子，越要藏住第二层意思。」', status: '参考型 · 可被召唤',
    intro: '基于公开作品与访谈整理出的哲思情歌方法论分身，擅长把情绪写成悖论、留白和心理暗流。',
    method: '先找到一句情感悖论，再把人物关系写成未说出口的自我辩论；少解释，多留空白，让副歌像一句平静的刺。',
    avoid: '不代表本人，不复刻原词，不使用真实署名做召唤入口；避免直接引用名句、过度玄学和把情绪解释得太满。',
    representativeWorks: ['暗涌之后', '未寄出的约定', '红尘留白'],
    styleWeights: { 哲思: 0.9, 心理转折: 0.88, 留白: 0.86, 悖论: 0.84 } },
  { id: 11, name: '山丘旁白', dir: '作词', lv: 4, calls: 0, adopt: 84, tags: ['人生白描','口语叙事'], emoji: '⛰️', color: '#92400E',
    motto: '「别急着押韵，先把那句真话说出来。」', status: '参考型 · 可被召唤',
    intro: '基于公开作品与访谈整理出的人生白描作词方法论分身，擅长口语叙事、中年回望和真实刺痛。',
    method: '先用普通人会说的话写出矛盾，再把时间、亲情、错过和自嘲压进一两句；副歌不要漂亮，要像多年后终于承认。',
    avoid: '不代表本人，不复刻原词，不使用真实署名做召唤入口；避免鸡汤口号、过度文艺和仿冒具体作品语气。',
    representativeWorks: ['旧歌旁白', '半生车站', '把话说完'],
    styleWeights: { 口语: 0.9, 人生感: 0.88, 白描: 0.86, 真实刺痛: 0.82 } },
  { id: 12, name: '霓虹动机室', dir: '作曲', lv: 4, calls: 0, adopt: 86, tags: ['流行电子','短动机'], emoji: '💡', color: '#2563EB',
    motto: '「先抓住两小节，让整首歌围着它发光。」', status: '参考型 · 可被召唤',
    intro: '基于公开流行电子作品与创作访谈整理出的作曲方法论分身，擅长短动机、强 Hook 和传播型副歌。',
    method: '先定 2 小节 motif，再用重复、切分和音区抬升做记忆点；主歌低位克制，副歌第一句直接亮出核心动机。',
    avoid: '不代表本人，不复刻旋律，不使用真实署名做召唤入口；避免照搬具体歌曲动机、过度复杂转调和无记忆点铺陈。',
    representativeWorks: ['霓虹短句', '热浪动机', '四拍回声'],
    styleWeights: { 短动机: 0.9, Hook旋律: 0.88, 流行电子: 0.86, 切分: 0.8 } },
  { id: 13, name: '旧调旋律铺', dir: '作曲', lv: 4, calls: 0, adopt: 85, tags: ['抒情大歌','长线旋律'], emoji: '🎹', color: '#BE123C',
    motto: '「副歌不是更响，是终于把气息放开。」', status: '参考型 · 可被召唤',
    intro: '基于公开抒情流行作品与创作访谈整理出的作曲方法论分身，重视长线旋律、气口和副歌情绪释放。',
    method: '先写能唱完整句的旋律线，再安排主歌低位、预副歌蓄力、副歌上扬；用长音和尾句回落承接情绪。',
    avoid: '不代表本人，不复刻旋律，不使用真实署名做召唤入口；避免炫技转音、过密音符和副歌只靠音高硬顶。',
    representativeWorks: ['旧调慢热', '热风长线', '晚霞副歌'],
    styleWeights: { 长线旋律: 0.9, 抒情: 0.88, 副歌上扬: 0.86, 气口: 0.8 } },
  { id: 14, name: '冷拍实验室', dir: '作曲', lv: 4, calls: 0, adopt: 83, tags: ['冷感电子','循环'], emoji: '🧊', color: '#0E7490',
    motto: '「不急着爆发，让重复自己产生温度。」', status: '参考型 · 可被召唤',
    intro: '基于公开冷感电子与实验流行作品整理出的作曲方法论分身，擅长克制循环、低位旋律和合成器纹理。',
    method: '先做一个冷色短音型循环，再用微小节奏变化、音色滤波和低位旋律推进；副歌不大开，但要形成阴影里的记忆。',
    avoid: '不代表本人，不复刻旋律，不使用真实署名做召唤入口；避免传统大歌走向、甜美副歌和过度温暖钢琴叙事。',
    representativeWorks: ['冷拍街灯', '低温回路', '蓝色热浪'],
    styleWeights: { 冷感: 0.9, 循环: 0.86, 实验: 0.84, 合成器: 0.82 } },
  { id: 15, name: '弦雾织造所', dir: '编曲', lv: 4, calls: 0, adopt: 85, tags: ['弦乐','电影感'], emoji: '🎻', color: '#047857',
    motto: '「让空间先出现，乐器才有位置。」', status: '参考型 · 可被召唤',
    intro: '基于公开弦乐与电影感流行编曲整理出的方法论分身，擅长弦乐层次、空气感和慢速能量铺开。',
    method: '先画空间和能量曲线，再决定钢琴、pad、弦乐进入顺序；Verse 留白，Pre 加低弦，Chorus 用弦乐和和声打开画面。',
    avoid: '不代表本人，不复刻编曲，不使用真实署名做召唤入口；避免弦乐糊成墙、抢人声和无差别全程铺满。',
    representativeWorks: ['热雾弦影', '晚风铺陈', '城市长镜头'],
    styleWeights: { 弦乐: 0.9, 空间感: 0.88, 电影感: 0.86, 留白: 0.8 } },
  { id: 16, name: '热浪鼓组', dir: '编曲', lv: 4, calls: 0, adopt: 84, tags: ['鼓组','Bass'], emoji: '🥁', color: '#DC2626',
    motto: '「副歌进来的那一秒，要像门被热风推开。」', status: '参考型 · 可被召唤',
    intro: '基于公开节奏型流行编曲整理出的方法论分身，擅长鼓组推进、Bass 律动和副歌能量爆发。',
    method: '先定 kick/snare 骨架，再安排 Bass 八分推进、拍手、反拍 hi-hat 和过门；每段只新增一两件关键元素。',
    avoid: '不代表本人，不复刻编曲，不使用真实署名做召唤入口；避免鼓点抢词、全程满编和无意义 crash 堆叠。',
    representativeWorks: ['柏油鼓点', '副歌热风', '低频巷口'],
    styleWeights: { 鼓组: 0.9, Bass: 0.86, 副歌爆发: 0.84, 层次推进: 0.82 } },
  { id: 17, name: '霓虹合成器', dir: '编曲', lv: 4, calls: 0, adopt: 83, tags: ['合成器','都市电子'], emoji: '🔷', color: '#4F46E5',
    motto: '「让城市的光变成颗粒，再铺到人声背后。」', status: '参考型 · 可被召唤',
    intro: '基于公开都市电子与合成器流行编曲整理出的方法论分身，擅长合成器颗粒、冷色纹理和循环律动。',
    method: '先做合成器 pad 和 arpeggio 纹理，再用 sidechain、颗粒延迟和滤波推进；副歌保持都市冷光，不把人声淹掉。',
    avoid: '不代表本人，不复刻编曲，不使用真实署名做召唤入口；避免音色过脏、低频糊、人声被合成器盖住。',
    representativeWorks: ['霓虹空调房', '蓝色街角', '颗粒夏夜'],
    styleWeights: { 合成器: 0.9, 都市电子: 0.86, 颗粒感: 0.84, 冷色纹理: 0.82 } },
  { id: 18, name: '贴耳人声室', dir: '制作', lv: 4, calls: 0, adopt: 86, tags: ['贴耳人声','亲密感'], emoji: '🎙️', color: '#DB2777',
    motto: '「先让人声靠近，情绪才会被听见。」', status: '参考型 · 可被召唤',
    intro: '基于公开人声制作与混音方法整理出的制作方法论分身，擅长贴耳人声、气声细节和亲密空间。',
    method: '先确定人声在最前景，主歌轻压缩和短混响，副歌加入窄幅和声与句尾 delay；低频收紧，所有音色都给人声让位。',
    avoid: '不代表本人，不复刻制作，不使用真实署名做召唤入口；避免人声后置、混响过长、低频压住咬字。',
    representativeWorks: ['耳边热风', '短混响房间', '一句很近的话'],
    styleWeights: { 贴耳人声: 0.92, 气声: 0.84, 短混响: 0.82, 低频收紧: 0.8 } },
  { id: 19, name: '热浪低频台', dir: '制作', lv: 4, calls: 0, adopt: 85, tags: ['低频','律动制作'], emoji: '🔊', color: '#B45309',
    motto: '「让副歌先撞到身体，再进入耳朵。」', status: '参考型 · 可被召唤',
    intro: '基于公开流行制作与低频管理方法整理出的制作方法论分身，擅长 punchy bass、鼓组冲击和副歌响度推进。',
    method: '先分离 kick 与 bass，副歌提升低频和鼓组贴脸感；人声略靠前但不削弱律动，母带保持响度和动态之间的平衡。',
    avoid: '不代表本人，不复刻制作，不使用真实署名做召唤入口；避免低频糊、响度硬压、人声被鼓组挤掉。',
    representativeWorks: ['柏油低频', '热浪副歌台', '鼓点晒场'],
    styleWeights: { 低频控制: 0.92, 鼓组冲击: 0.86, Bass: 0.86, 响度推进: 0.82 } },
  { id: 20, name: '冷光母带间', dir: '制作', lv: 4, calls: 0, adopt: 84, tags: ['冷感母带','都市质感'], emoji: '💿', color: '#4338CA',
    motto: '「让高频像玻璃反光，低频像远处的脉冲。」', status: '参考型 · 可被召唤',
    intro: '基于公开都市电子制作和母带方法整理出的制作方法论分身，擅长冷光质感、颗粒高频和克制动态。',
    method: '先确定冷色空间和中近人声，再保留合成器宽度、颗粒 delay 与 sidechain pulse；母带清透，不追求大爆发。',
    avoid: '不代表本人，不复刻制作，不使用真实署名做召唤入口；避免高频刺耳、合成器盖住人声、母带过度压缩。',
    representativeWorks: ['玻璃空调房', '蓝色母带', '冷光街口'],
    styleWeights: { 冷感: 0.9, 清透母带: 0.86, 颗粒高频: 0.84, 都市空间: 0.82 } },
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
    { status: 'active', mode: startWithResult ? 'result' : 'choose', avatarId: startWithResult ? 0 : null, confirmed: false, revisionCount: 0, output: null, selectedCandidateId: null, candidates: [] },
    { status: 'pending', mode: 'choose', avatarId: null, confirmed: false, revisionCount: 0, output: null, selectedCandidateId: null, candidates: [] },
    { status: 'pending', mode: 'choose', avatarId: null, confirmed: false, revisionCount: 0, output: null, selectedCandidateId: null, candidates: [] },
    { status: 'pending', mode: 'choose', avatarId: null, confirmed: false, revisionCount: 0, output: null, selectedCandidateId: null, candidates: [] },
  ];
}

export function createStepCandidate(avatar: AvatarProfile, avatarIndex: number, output: GenerationStepOutput, revisionCount = 0): StepCandidate {
  const normalized = normalizeAvatar(avatar);
  return {
    id: `${normalized.id}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    avatarIndex,
    avatarId: normalized.id,
    avatarName: normalized.name,
    avatarLevel: normalized.lv,
    avatarColor: normalized.color,
    avatarTags: normalized.tags,
    avatarMotto: normalized.motto,
    output,
    revisionCount,
    createdAt: new Date().toISOString(),
  };
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

function clampScore(value: number) {
  return Math.max(18, Math.min(96, Math.round(value)));
}

function weightValue(avatar: AvatarProfile, patterns: string[]) {
  const weights = avatar.styleWeights ?? {};
  return Object.entries(weights).reduce((score, [key, value]) => (
    patterns.some((pattern) => key.includes(pattern)) ? Math.max(score, value) : score
  ), 0);
}

function hasStyle(avatar: AvatarProfile, patterns: string[]) {
  const haystack = [
    avatar.name,
    avatar.dir,
    avatar.tags.join(' '),
    avatar.intro,
    avatar.method,
    avatar.motto,
    Object.keys(avatar.styleWeights ?? {}).join(' '),
  ].join(' ');
  return patterns.some((pattern) => haystack.includes(pattern));
}

function dimension(key: string, label: string, value: number, low: string, high: string): StyleDimension {
  const score = clampScore(value);
  return {
    key,
    label,
    value: score,
    text: score >= 68 ? high : low,
  };
}

function averageDimension(contributions: ContributionSnapshot[], key: string) {
  const values = contributions
    .map((item) => item.styleSignature?.dimensions.find((dimension) => dimension.key === key)?.value)
    .filter((value): value is number => typeof value === 'number');
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function topWeightedTags(avatar: AvatarProfile) {
  const weighted = Object.entries(avatar.styleWeights ?? {})
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);
  return [...weighted, ...avatar.tags].filter(Boolean);
}

function signatureHeadline(tags: string[], fallback: string) {
  const unique = [...new Set(tags)].slice(0, 3);
  return unique.length ? unique.join(' × ') : fallback;
}

export function buildStepStyleSignature(input: {
  stepIndex: number;
  project: ProjectBrief;
  avatar: AvatarProfile;
  previousContributions: ContributionSnapshot[];
}): StyleSignature {
  const avatar = normalizeAvatar(input.avatar);
  const inheritedWarmth = averageDimension(input.previousContributions, 'mixWarmth');
  const inheritedRisk = averageDimension(input.previousContributions, 'riskLevel');
  const inheritedDensity = averageDimension(input.previousContributions, 'arrangementDensity');
  const baseTags = topWeightedTags(avatar);
  const projectWarm = /温暖|治愈|民谣|抒情/.test(`${input.project.genre} ${input.project.mood}`) ? 12 : 0;
  const projectElectronic = /电子|赛博|未来/.test(input.project.genre) ? 14 : 0;

  if (input.stepIndex === 0) {
    const folk = weightValue(avatar, ['民谣', '口语', '自然', '留白']);
    const ornate = weightValue(avatar, ['古风', '情感', '画面', 'Hook']);
    const tags = folk > ornate ? ['民谣口语', '自然留白', '低声叙事'] : ['古风画面', '情绪转折', '复唱Hook'];
    return {
      headline: signatureHeadline(tags, '歌词语气成型'),
      tags,
      dimensions: [
        dimension('lyricTone', '歌词语气', 58 + ornate * 32 + folk * 18, '朴素口语', '意象浓、情绪转折强'),
        dimension('imageryDensity', '意象密度', 48 + ornate * 38 - folk * 8, '留白叙事', '画面密集'),
        dimension('riskLevel', '风格风险', 36 + ornate * 14 + folk * 8, '稳妥贴题', '表达更有辨识度'),
      ],
      downstreamImpact: `作曲将继承「${tags[0]}」的咬字长度和情绪重心，副歌需要匹配 ${tags[2]}。`,
      promptTraits: tags,
    };
  }

  if (input.stepIndex === 1) {
    const electronic = weightValue(avatar, ['电子', '合成器', '冷感', '实验']) + (hasStyle(avatar, ['电子']) ? 0.1 : 0);
    const hook = weightValue(avatar, ['Hook', '流行', '节奏']);
    const tags = electronic > hook ? ['冷感电子', '短动机循环', '合成器记忆'] : ['流行跃升', '副歌大Hook', '短视频记忆点'];
    return {
      headline: signatureHeadline(tags, '旋律轮廓成型'),
      tags,
      dimensions: [
        dimension('melodyShape', '旋律轮廓', 52 + hook * 36 + electronic * 10, '克制低位', '副歌跃升明显'),
        dimension('riskLevel', '风格风险', 40 + electronic * 34 + inheritedRisk * 0.12 + projectElectronic, '主流稳妥', '实验感更强'),
        dimension('energyCurve', '能量曲线', 50 + hook * 28 + electronic * 18, '平缓推进', '段落反差清楚'),
      ],
      downstreamImpact: `编曲将围绕「${tags[0]}」安排主音色，制作时要保留 ${tags[2]}。`,
      promptTraits: tags,
    };
  }

  if (input.stepIndex === 2) {
    const space = weightValue(avatar, ['氛围', '弦乐', '空间', '人声留白']);
    const groove = weightValue(avatar, ['鼓组', '层次', 'Bass', '副歌爆发']);
    const tags = groove > space ? ['鼓组推进', '低频律动', '副歌推门感'] : ['弦乐空间', '氛围铺陈', '人声留白'];
    return {
      headline: signatureHeadline(tags, '编曲骨架成型'),
      tags,
      dimensions: [
        dimension('arrangementDensity', '编曲密度', 46 + groove * 38 + space * 14 + inheritedDensity * 0.08, '留白清楚', '层次更满'),
        dimension('vocalSpace', '人声空间', 52 + space * 34 - groove * 6, '贴耳直接', '空间感更开'),
        dimension('energyCurve', '能量曲线', 50 + groove * 34 + space * 14, '缓慢铺开', '副歌推进强'),
      ],
      downstreamImpact: `制作将按「${tags[0]}」决定低频、混响和人声前后位置，最终 Demo 会明显偏向 ${tags[1]}。`,
      promptTraits: tags,
    };
  }

  const vocal = weightValue(avatar, ['人声', 'RnB', '亲密', '混音']);
  const warm = weightValue(avatar, ['温暖', '母带', '空间', '清晰']);
  const tags = hasStyle(avatar, ['暖声', '温暖', '亲密']) ? ['贴耳人声', '暖色母带', '柔和空间'] : ['R&B质感', '低频控制', '清晰混音'];
  return {
    headline: signatureHeadline(tags, '制作质感成型'),
    tags,
    dimensions: [
      dimension('vocalTexture', '人声质感', 50 + vocal * 38 + projectWarm, '靠后融入', '贴耳靠前'),
      dimension('mixWarmth', '混音温度', 46 + warm * 38 + inheritedWarmth * 0.12 + projectWarm, '冷静清透', '温暖柔和'),
      dimension('arrangementDensity', '成品密度', 48 + inheritedDensity * 0.32 + vocal * 16, '清爽留白', '饱满完整'),
    ],
    downstreamImpact: `最终生成会按「${tags[0]}」锁定人声位置，并把组合整体收束到 ${tags[1]}。`,
    promptTraits: tags,
  };
}

export function buildCombinationStyleSignature(contributions: ContributionSnapshot[]): StyleSignature {
  const signatures = contributions.map((item) => item.styleSignature).filter((item): item is StyleSignature => Boolean(item));
  const promptTraits = signatures.flatMap((signature) => signature.promptTraits);
  const tags = [...new Set(signatures.flatMap((signature) => signature.tags))].slice(0, 6);
  const allDimensions = signatures.flatMap((signature) => signature.dimensions);
  const dimensionKeys = [...new Set(allDimensions.map((item) => item.key))];
  const dimensions = dimensionKeys.slice(0, 5).map((key) => {
    const entries = allDimensions.filter((item) => item.key === key);
    const value = entries.reduce((sum, item) => sum + item.value, 0) / entries.length;
    const label = entries[entries.length - 1]?.label ?? key;
    const text = entries[entries.length - 1]?.text ?? '';
    return dimension(key, label, value, '偏克制', text || '辨识度更强');
  });

  return {
    headline: signatureHeadline(tags, '组合风格待成型'),
    tags,
    dimensions,
    downstreamImpact: contributions.length
      ? `后续作曲、编曲和制作会继承「${signatureHeadline(tags, '当前方向')}」；制作阶段会把这些选择写进最终 Prompt。`
      : '还没有确认任何环节，组合风格会从第一位分身开始累积。',
    promptTraits: [...new Set(promptTraits)].slice(0, 8),
  };
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
    styleSignature: output?.styleSignature,
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
    id: `local_work_${Date.now()}`,
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
