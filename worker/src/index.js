const DEFAULT_ALLOWED_ORIGINS = [
  'https://wzy88.github.io',
  'https://wzy88.github.io/MuseGrid',
  'http://localhost:4326',
  'http://127.0.0.1:4326',
  'http://localhost:4331',
  'http://127.0.0.1:4331',
];

const DEFAULT_MINIMAX_API_HOST = 'https://api.minimaxi.com';
const STEP_LABELS = ['作词', '作曲', '编曲', '制作 Demo'];
const memoryBuckets = new Map();

export function json(data, init = {}, request, env = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(request, env),
      ...(init.headers || {}),
    },
  });
}

export function corsHeaders(request, env = {}) {
  const origin = request?.headers?.get('origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const allowOrigin = allowed.includes('*') || allowed.includes(origin) || origin.endsWith('.pages.dev') ? origin || '*' : allowed[0] || '*';
  return {
    'access-control-allow-origin': allowOrigin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-max-age': '86400',
  };
}

export function checkRateLimit(request, env = {}) {
  const limit = Number(env.RATE_LIMIT_PER_HOUR || 60);
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const current = memoryBuckets.get(ip) || { count: 0, resetAt: now + hour };
  if (current.resetAt <= now) {
    current.count = 0;
    current.resetAt = now + hour;
  }
  current.count += 1;
  memoryBuckets.set(ip, current);
  return {
    ok: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    resetAt: new Date(current.resetAt).toISOString(),
  };
}

export function makeFallbackStepOutput(input = {}) {
  const stepIndex = Number(input.stepIndex || 0);
  const project = input.project || {};
  const avatar = input.avatar || {};
  const title = project.title || '新歌计划';
  const idea = project.idea || '一次新的音乐创作';
  const genre = project.genre || '流行';
  const mood = project.mood || '温暖';
  const label = STEP_LABELS[stepIndex] || '创作';
  const revised = Number(input.revisionCount || 0) > 0 || Boolean(input.feedback);

  if (stepIndex === 0) {
    return {
      stepLabel: label,
      source: 'mock',
      summary: `${title}歌词方向：围绕「${idea.slice(0, 24)}」建立叙事线，副歌收束为可记忆 Hook。`,
      blocks: [
        { label: '主题理解', value: `以${mood}作为主情绪，把场景、人物和一次转折压进主副歌。` },
        { label: 'Hook 候选', value: `我把${title}唱给风听 / 旧梦在灯下慢慢苏醒 / 你来过，所以远方有回声` },
        { label: '主歌', value: `【Verse】\n雨落在旧车站的玻璃窗\n你撑着伞站在昏黄灯光\n我们把沉默说得很轻\n像怕惊醒那一段远方` },
        { label: '副歌', value: `【Chorus】\n${title}开向没有你的远方\n旧友的名字还停在心上\n如果重逢只是短暂月光\n我也愿把遗憾唱到天亮` },
      ],
      lyrics: `[Verse]\n雨落在旧车站的玻璃窗\n你撑着伞站在昏黄灯光\n我们把沉默说得很轻\n像怕惊醒那一段远方\n\n[Chorus]\n${title}开向没有你的远方\n旧友的名字还停在心上\n如果重逢只是短暂月光\n我也愿把遗憾唱到天亮`,
      prompt: '',
      confidence: revised ? 0.87 : 0.82,
    };
  }

  if (stepIndex === 1) {
    return {
      stepLabel: label,
      source: 'mock',
      summary: `${title}旋律方案：${genre}，主歌低位叙事，副歌五度上行形成记忆点。`,
      blocks: [
        { label: '歌曲结构', value: 'Intro 4小节 → Verse A → Chorus → Verse B → Bridge → Final Chorus' },
        { label: '速度/调性', value: '118-122 BPM，F 大调或 D 小调，根据最终人声选择。' },
        { label: '旋律走向', value: '主歌采用级进，副歌第一句跃升，末句回落留出余味。' },
        { label: '给编曲的输入', value: `保留${genre}核心音色，副歌需要更明显的鼓组和和声托举。` },
      ],
      lyrics: '',
      prompt: `${genre}, ${mood}, memorable chorus, 120 BPM, warm vocal melody`,
      confidence: revised ? 0.88 : 0.84,
    };
  }

  if (stepIndex === 2) {
    return {
      stepLabel: label,
      source: 'mock',
      summary: `${title}编曲方案：用传统音色建立辨识度，用电子鼓组和低频保证传播性。`,
      blocks: [
        { label: '乐器配置', value: '古琴 / 钢琴 / 弦乐 Pad / Sub Bass / 电子鼓组 / 人声和声' },
        { label: '段落推进', value: 'Intro 留白，Verse 保持空间，Chorus 全编进入，Bridge 抽离后再爆发。' },
        { label: '声音质感', value: '人声前置，中频温暖，混响短而清晰，高频保持空气感。' },
        { label: '给制作的输入', value: '输出时强调 vocal clarity、warm mix、cinematic but radio-friendly。' },
      ],
      lyrics: '',
      prompt: `${genre}, ${mood}, guqin, cinematic strings, modern drums, warm mix, vocal forward`,
      confidence: revised ? 0.89 : 0.85,
    };
  }

  return {
    stepLabel: label,
    source: 'mock',
    summary: `${title}最终制作包：歌词、旋律、编曲和混音方向已整合，可进入音乐模型生成。`,
    blocks: [
      { label: '最终制作 Prompt', value: `${genre}女声，${mood}，120BPM，古琴/合成器/弦乐/现代鼓组融合，人声清晰靠前，暖色调混音，副歌有记忆点。` },
      { label: '人声质感', value: '温暖、真诚、略带气声，主歌克制，副歌释放。' },
      { label: '混音倾向', value: '中频饱满，低频收紧，高频清透但不刺耳。' },
      { label: '发布备注', value: `适合${project.intendedUse || '个人创作'}，可进一步生成封面和社媒文案。` },
    ],
    lyrics: '',
    prompt: `${genre}, ${mood}, Chinese female vocal, 120 BPM, guqin, synth, strings, modern drums, warm mix, catchy chorus`,
    confidence: revised ? 0.9 : 0.86,
  };
}

export function makeFallbackMusicOutput(input = {}) {
  const project = input.project || {};
  const title = project.title || '新歌计划';
  return {
    source: 'mock',
    title,
    status: 'mock_ready',
    duration: '3:38',
    audioUrl: '',
    audioHex: '',
    prompt: input.prompt || `${project.genre || '流行'}，${project.mood || '温暖'}，120BPM，人声清晰靠前`,
    message: '已生成可体验的模拟 Demo。配置 MiniMax API Key 并开启音乐生成后，会返回真实音频地址。',
    minimaxTraceId: '',
  };
}

function cleanModelText(text) {
  return String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

export function makeUnstructuredStepOutput(input = {}, content = '') {
  const base = makeFallbackStepOutput(input);
  const clean = cleanModelText(content);
  const summary = clean
    .split(/\n+/)
    .find((line) => line.trim().length > 0)
    ?.trim()
    .slice(0, 180) || base.summary;
  return {
    ...base,
    source: 'minimax_text_unstructured',
    summary,
    blocks: [
      { label: 'MiniMax 原始交付', value: clean.slice(0, 900) || base.summary },
      ...base.blocks.slice(0, 3),
    ],
    lyrics: input.stepIndex === 0 ? clean || base.lyrics : base.lyrics,
    prompt: input.stepIndex === 0 ? base.prompt : clean.slice(0, 500) || base.prompt,
  };
}

export function buildStepPrompt(input = {}) {
  const project = input.project || {};
  const avatar = input.avatar || {};
  const previous = Array.isArray(input.previousContributions) ? input.previousContributions : [];
  return [
    '你是 MuseGrid 的音乐创作分身后端。请根据项目、当前环节、分身人格和上游贡献，生成结构化交付。',
    '只输出 JSON，不要 Markdown，不要解释。JSON 字段必须包括：stepLabel, summary, blocks, lyrics, prompt, confidence。',
    'blocks 是数组，每项包含 label 和 value。lyrics 只在作词环节输出完整歌词，其他环节可为空。prompt 是给后续音乐模型的英文/中英混合风格提示。',
    `当前环节：${STEP_LABELS[input.stepIndex] || '创作'}`,
    `项目标题：${project.title || ''}`,
    `创作灵感：${project.idea || ''}`,
    `语言/风格/情绪：${project.language || '中文'} / ${project.genre || ''} / ${project.mood || ''}`,
    `分身：${avatar.name || ''}，方向：${avatar.dir || ''}，格言：${avatar.motto || ''}`,
    `上游贡献：${JSON.stringify(previous.map((item) => ({ step: item.step, avatar: item.avatar, output: item.output }))).slice(0, 2200)}`,
    input.feedback ? `用户修改意见：${input.feedback}` : '用户修改意见：无',
  ].join('\n');
}

export function extractJsonObject(text) {
  if (!text || typeof text !== 'string') return null;
  const stripped = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const match = stripped.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function minimaxApiUrl(env, path) {
  const host = (env.MINIMAX_API_HOST || DEFAULT_MINIMAX_API_HOST).replace(/\/$/, '');
  return `${host}${path}`;
}

async function callMiniMaxText(input, env) {
  if (!env.MINIMAX_API_KEY) return makeFallbackStepOutput(input);
  const prompt = buildStepPrompt(input);
  const response = await fetch(minimaxApiUrl(env, '/v1/text/chatcompletion_v2'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.MINIMAX_TEXT_MODEL || 'MiniMax-M3',
      messages: [
        { role: 'system', name: 'MuseGrid', content: '你是专业音乐制作协作系统，擅长歌词、作曲、编曲和制作交付。输出必须是严格 JSON，不要 Markdown。字段内容要短，summary 不超过 120 字，blocks 最多 6 项，每项 value 不超过 90 字，确保 JSON 可解析。' },
        { role: 'user', name: 'creator', content: prompt },
      ],
      temperature: 0.8,
      max_completion_tokens: 3200,
    }),
  });

  if (!response.ok) {
    const fallback = makeFallbackStepOutput(input);
    fallback.source = 'mock_after_minimax_error';
    fallback.error = `MiniMax text API ${response.status}`;
    return fallback;
  }

  const data = await response.json();
  if (data?.base_resp && data.base_resp.status_code !== 0) {
    const fallback = makeFallbackStepOutput(input);
    fallback.source = 'mock_after_minimax_error';
    fallback.error = data.base_resp.status_msg || `MiniMax text business error ${data.base_resp.status_code}`;
    return fallback;
  }
  const content = data?.choices?.[0]?.message?.content || '';
  const parsed = extractJsonObject(content);
  if (!parsed) {
    return makeUnstructuredStepOutput(input, content);
  }
  return {
    ...makeFallbackStepOutput(input),
    ...parsed,
    source: 'minimax_text',
  };
}

async function callMiniMaxMusic(input, env) {
  if (!env.MINIMAX_API_KEY || env.MINIMAX_ENABLE_MUSIC !== 'true') {
    return makeFallbackMusicOutput(input);
  }

  const response = await fetch(minimaxApiUrl(env, '/v1/music_generation'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.MINIMAX_MUSIC_MODEL || 'music-2.6-free',
      prompt: String(input.prompt || '').slice(0, 2000),
      lyrics: String(input.lyrics || '').slice(0, 3500),
      lyrics_optimizer: !input.lyrics,
      output_format: 'url',
      audio_setting: {
        sample_rate: 44100,
        bitrate: 256000,
        format: 'mp3',
      },
    }),
  });

  if (!response.ok) {
    const fallback = makeFallbackMusicOutput(input);
    fallback.source = 'mock_after_minimax_error';
    fallback.message = `MiniMax 音乐接口返回 ${response.status}，本次保留模拟 Demo。`;
    return fallback;
  }

  const data = await response.json();
  if (data?.base_resp && data.base_resp.status_code !== 0) {
    const fallback = makeFallbackMusicOutput(input);
    fallback.source = 'mock_after_minimax_error';
    fallback.message = data.base_resp.status_msg || `MiniMax 音乐接口业务错误 ${data.base_resp.status_code}，本次保留模拟 Demo。`;
    return fallback;
  }
  return {
    ...makeFallbackMusicOutput(input),
    source: 'minimax_music',
    status: data?.data?.status === 2 ? 'done' : 'processing',
    audioUrl: data?.data?.audio || '',
    duration: data?.extra_info?.music_duration ? `${Math.round(data.extra_info.music_duration / 1000)}s` : '生成完成',
    message: '真实音频已由 MiniMax 返回。URL 可能会过期，请及时保存。',
    minimaxTraceId: data?.trace_id || '',
  };
}

async function readJson(request) {
  const text = await request.text();
  if (text.length > 64_000) {
    throw new Error('请求内容过大');
  }
  return text ? JSON.parse(text) : {};
}

async function handleRequest(request, env) {
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request, env) });
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    return json({
      ok: true,
      service: 'musegrid-worker',
      minimaxText: Boolean(env.MINIMAX_API_KEY),
      minimaxMusic: Boolean(env.MINIMAX_API_KEY && env.MINIMAX_ENABLE_MUSIC === 'true'),
      time: new Date().toISOString(),
    }, {}, request, env);
  }

  if (request.method !== 'POST') {
    return json({ error: 'Not found' }, { status: 404 }, request, env);
  }

  const rate = checkRateLimit(request, env);
  if (!rate.ok) {
    return json({ error: 'Rate limit exceeded', resetAt: rate.resetAt }, { status: 429 }, request, env);
  }

  try {
    const input = await readJson(request);
    if (url.pathname === '/api/generate-step') {
      const output = await callMiniMaxText(input, env);
      return json({ ok: true, output, rate }, {}, request, env);
    }
    if (url.pathname === '/api/generate-music') {
      const output = await callMiniMaxMusic(input, env);
      return json({ ok: true, output, rate }, {}, request, env);
    }
    return json({ error: 'Not found' }, { status: 404 }, request, env);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 }, request, env);
  }
}

export default {
  fetch: handleRequest,
};
