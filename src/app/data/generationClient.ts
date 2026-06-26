import {
  AVATARS,
  STEP_META,
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

export function createLocalStepOutput(input: GenerateStepInput): GenerationStepOutput {
  const { stepIndex, project } = input;
  const revised = (input.revisionCount ?? 0) > 0 || Boolean(input.feedback?.trim());

  if (stepIndex === 0) {
    return {
      stepLabel: STEP_META[stepIndex].label,
      source: 'local_mock',
      summary: outputSummary(stepIndex, project),
      blocks: [
        { label: '主题理解', value: `围绕「${project.idea}」提炼成 ${project.mood} 的叙事情绪。` },
        { label: '故事角度', value: `以「${project.title}」为核心意象，把重逢、离别和自我和解压进副歌。` },
        { label: '主歌', value: lyricText(project).split('【副歌】')[0].replace('【主歌】', '').trim() },
        { label: '副歌', value: (lyricText(project).split('【副歌】')[1] ?? '').trim() },
      ],
      lyrics: lyricText(project),
      prompt: '',
      confidence: revised ? 0.87 : 0.82,
    };
  }

  if (stepIndex === 1) {
    return {
      stepLabel: STEP_META[stepIndex].label,
      source: 'local_mock',
      summary: outputSummary(stepIndex, project),
      blocks: [
        { label: '歌曲结构', value: '主歌×2 → 副歌 → 主歌 → 副歌 → Bridge → 副歌×2' },
        { label: 'Hook 情绪', value: `${project.mood} · 克制 · 有记忆点` },
        { label: '速度范围', value: '118-122 BPM，大调，适合流行副歌抬升' },
        { label: '旋律描述', value: '主歌旋律平缓叙事，副歌跃升明显，Bridge 转调营造高潮' },
        { label: '给编曲的输入', value: `需要 ${project.genre} 的核心音色，intro 保留故事感引子` },
      ],
      lyrics: '',
      prompt: `${project.genre}, ${project.mood}, 120BPM, memorable chorus`,
      confidence: revised ? 0.88 : 0.84,
    };
  }

  if (stepIndex === 2) {
    return {
      stepLabel: STEP_META[stepIndex].label,
      source: 'local_mock',
      summary: outputSummary(stepIndex, project),
      blocks: [
        { label: '乐器配置', value: '古琴 / 合成器 / 钢琴 / 弦乐组 / 电子鼓组 / Bass' },
        { label: '鼓组方向', value: '轻拍打点为主，副歌全鼓进入，强调 kick 与 snare 对比' },
        { label: '和声铺底', value: '弦乐 pad 始终存在，副歌增加 vocal harmony' },
        { label: '段落推进', value: 'Intro 留白 → Verse 轻器乐 → Chorus 全编 → Bridge 剥离后爆发' },
        { label: '给制作的输入', value: '整体偏暖色调混音，人声前置，reverb 不要过深' },
      ],
      lyrics: '',
      prompt: `${project.genre}, guqin, synth, piano, strings, modern drums, warm arrangement`,
      confidence: revised ? 0.89 : 0.85,
    };
  }

  return {
    stepLabel: STEP_META[stepIndex].label,
    source: 'local_mock',
    summary: outputSummary(stepIndex, project),
    blocks: [
      { label: '最终制作 Prompt', value: finalPrompt(project) },
      { label: '人声质感', value: '温暖女声，略带气声，真诚感优先' },
      { label: '演唱建议', value: '主歌克制，副歌释放，Bridge 音量收回后再推出' },
      { label: '混音倾向', value: '中频饱满，低频收紧，高频清透不刺耳' },
    ],
    lyrics: '',
    prompt: finalPrompt(project),
    confidence: revised ? 0.9 : 0.86,
  };
}

export function createLocalMusicOutput(input: GenerateMusicInput): GenerationMusicOutput {
  const prompt = [...input.stepOutputs].reverse().find((output) => output?.prompt)?.prompt || finalPrompt(input.project);
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
