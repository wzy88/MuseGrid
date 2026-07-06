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
const musicBuckets = new Map();
const DEFAULT_STYLE_WEIGHT = 0.55;

function score(value) {
  return Math.max(18, Math.min(96, Math.round(value)));
}

function avatarText(avatar = {}) {
  return [
    avatar.name,
    avatar.dir,
    avatar.motto,
    avatar.intro,
    avatar.method,
    Array.isArray(avatar.tags) ? avatar.tags.join(' ') : '',
    Object.keys(avatar.styleWeights || {}).join(' '),
  ].join(' ');
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function makeDimension(key, label, value, text) {
  return { key, label, value: score(value), text };
}

function makeFallbackStyleSignature(input = {}) {
  const stepIndex = Number(input.stepIndex || 0);
  const avatar = input.avatar || {};
  const text = avatarText(avatar);

  if (stepIndex === 0) {
    const folk = hasAny(text, ['民谣', '自然', '口语', '留白']);
    const tags = folk ? ['民谣口语', '自然留白', '低声叙事'] : ['古风画面', '情绪转折', '复唱Hook'];
    return {
      headline: tags.join(' × '),
      tags,
      dimensions: [
        makeDimension('lyricTone', '歌词语气', folk ? 58 : 82, folk ? '朴素口语' : '意象浓、情绪转折强'),
        makeDimension('imageryDensity', '意象密度', folk ? 52 : 84, folk ? '留白叙事' : '画面密集'),
        makeDimension('riskLevel', '风格风险', folk ? 44 : 56, '稳妥贴题'),
      ],
      downstreamImpact: `作曲将继承「${tags[0]}」的咬字长度和情绪重心。`,
      promptTraits: tags,
    };
  }

  if (stepIndex === 1) {
    const electronic = hasAny(text, ['电子', '实验', '合成器', '冷感']);
    const tags = electronic ? ['冷感电子', '短动机循环', '合成器记忆'] : ['流行跃升', '副歌大Hook', '短视频记忆点'];
    return {
      headline: tags.join(' × '),
      tags,
      dimensions: [
        makeDimension('melodyShape', '旋律轮廓', electronic ? 62 : 86, electronic ? '克制低位' : '副歌跃升明显'),
        makeDimension('riskLevel', '风格风险', electronic ? 78 : 50, electronic ? '实验感更强' : '主流稳妥'),
        makeDimension('energyCurve', '能量曲线', electronic ? 70 : 82, '段落反差清楚'),
      ],
      downstreamImpact: `编曲将围绕「${tags[0]}」安排主音色。`,
      promptTraits: tags,
    };
  }

  if (stepIndex === 2) {
    const groove = hasAny(text, ['鼓组', 'Bass', '层次推进', '副歌爆发']);
    const tags = groove ? ['鼓组推进', '低频律动', '副歌推门感'] : ['弦乐空间', '氛围铺陈', '人声留白'];
    return {
      headline: tags.join(' × '),
      tags,
      dimensions: [
        makeDimension('arrangementDensity', '编曲密度', groove ? 86 : 64, groove ? '层次更满' : '留白清楚'),
        makeDimension('vocalSpace', '人声空间', groove ? 58 : 82, groove ? '贴耳直接' : '空间感更开'),
        makeDimension('energyCurve', '能量曲线', groove ? 86 : 68, groove ? '副歌推进强' : '缓慢铺开'),
      ],
      downstreamImpact: `制作将按「${tags[0]}」决定低频、混响和人声位置。`,
      promptTraits: tags,
    };
  }

  const warm = hasAny(text, ['暖声', '温暖', '亲密', '母带']);
  const tags = warm ? ['贴耳人声', '暖色母带', '柔和空间'] : ['R&B质感', '低频控制', '清晰混音'];
  return {
    headline: tags.join(' × '),
    tags,
    dimensions: [
      makeDimension('vocalTexture', '人声质感', warm ? 88 : 78, '贴耳靠前'),
      makeDimension('mixWarmth', '混音温度', warm ? 88 : 68, warm ? '温暖柔和' : '冷静清透'),
      makeDimension('arrangementDensity', '成品密度', warm ? 64 : 72, warm ? '清爽留白' : '饱满完整'),
    ],
    downstreamImpact: `最终生成会按「${tags[0]}」锁定人声位置，并收束到 ${tags[1]}。`,
    promptTraits: tags,
  };
}

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
  return checkBucketRateLimit(memoryBuckets, request, Number(env.RATE_LIMIT_PER_HOUR || 60));
}

export function checkMusicRateLimit(request, env = {}) {
  return checkBucketRateLimit(musicBuckets, request, Number(env.MUSIC_RATE_LIMIT_PER_HOUR || 3));
}

function checkBucketRateLimit(bucket, request, limit) {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const hour = 60 * 60 * 1000;
  const current = bucket.get(ip) || { count: 0, resetAt: now + hour };
  if (current.resetAt <= now) {
    current.count = 0;
    current.resetAt = now + hour;
  }
  current.count += 1;
  bucket.set(ip, current);
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
      styleSignature: makeFallbackStyleSignature(input),
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
      styleSignature: makeFallbackStyleSignature(input),
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
      styleSignature: makeFallbackStyleSignature(input),
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
    styleSignature: makeFallbackStyleSignature(input),
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

function extractJsonStringField(text, fieldName) {
  const source = String(text || '');
  const match = new RegExp(`"${fieldName}"\\s*:\\s*"`).exec(source);
  if (!match) return '';

  const openingQuoteIndex = match.index + match[0].length - 1;
  let escaped = false;
  for (let index = openingQuoteIndex + 1; index < source.length; index += 1) {
    const char = source[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      const rawString = source.slice(openingQuoteIndex, index + 1);
      try {
        return JSON.parse(rawString).trim();
      } catch {
        return rawString
          .slice(1, -1)
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\')
          .trim();
      }
    }
  }

  return '';
}

export function makeUnstructuredStepOutput(input = {}, content = '') {
  const base = makeFallbackStepOutput(input);
  const clean = cleanModelText(content);
  const extractedLyrics = extractJsonStringField(clean, 'lyrics');
  const extractedSummary = extractJsonStringField(clean, 'summary');
  const extractedPrompt = extractJsonStringField(clean, 'prompt');
  const primaryText = input.stepIndex === 0 && extractedLyrics ? extractedLyrics : clean;
  const summary = extractedSummary || primaryText
    .split(/\n+/)
    .find((line) => line.trim().length > 0)
    ?.trim()
    .slice(0, 180) || base.summary;
  return {
    ...base,
    source: 'minimax_text_unstructured',
    summary,
    blocks: [
      { label: extractedLyrics ? 'MiniMax 歌词正文' : 'MiniMax 原始交付', value: primaryText.slice(0, 900) || base.summary },
      ...base.blocks.slice(0, 3),
    ],
    lyrics: input.stepIndex === 0 ? primaryText || base.lyrics : base.lyrics,
    prompt: input.stepIndex === 0 ? extractedPrompt || base.prompt : extractedPrompt || clean.slice(0, 500) || base.prompt,
  };
}

function makeId(prefix) {
  const random = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${random}`;
}

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function clampText(value, fallback = '', max = 1200) {
  return String(value || fallback).trim().slice(0, max);
}

function initialStyleWeights(tags = [], strengths = []) {
  const weights = {};
  [...tags, ...strengths].filter(Boolean).forEach((tag, index) => {
    weights[tag] = Math.max(DEFAULT_STYLE_WEIGHT, 0.72 - index * 0.04);
  });
  return weights;
}

function rowToAvatar(row) {
  if (!row) return null;
  return {
    id: row.id,
    creatorId: row.creator_id,
    name: row.name,
    dir: row.dir,
    level: Number(row.level || 1),
    lv: Number(row.level || 1),
    calls: Number(row.calls || 0),
    adopt: Number(row.adopt || 0),
    tags: parseJson(row.tags_json, []),
    emoji: row.emoji || '✍️',
    color: row.color || '#6366F1',
    motto: row.motto || '',
    status: row.status || '状态良好',
    intro: row.intro || '',
    method: row.method || '',
    avoid: row.avoid || '',
    representativeWorks: parseJson(row.representative_works_json, []),
    reps: parseJson(row.representative_works_json, []),
    styleWeights: parseJson(row.style_weights_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToCalibration(row) {
  if (!row) return null;
  return {
    id: row.id,
    avatarId: row.avatar_id,
    creatorId: row.creator_id,
    scores: parseJson(row.scores_json, {}),
    answers: parseJson(row.answers_json, {}),
    parameterChanges: parseJson(row.parameter_changes_json, []),
    createdAt: row.created_at,
  };
}

function rowToWork(row, request) {
  if (!row) return null;
  const work = {
    id: row.id,
    creatorId: row.creator_id,
    title: row.title,
    status: row.status || 'done',
    color: row.color || '#4F46E5',
    tags: parseJson(row.tags_json, []),
    seed: Number(row.seed || 23),
    stepsDone: Number(row.steps_done || 4),
    progress: Number(row.progress ?? 1),
    desc: row.desc || '',
    plays: Number(row.plays || 0),
    likes: Number(row.likes || 0),
    shares: Number(row.shares || 0),
    completion: Number(row.completion || 0),
    earnings: Number(row.earnings || 0),
    duration: row.duration || '3:38',
    audioUrl: row.audio_url || '',
    generationSource: row.generation_source || '',
    finalPrompt: row.final_prompt || '',
    lyrics: row.lyrics || '',
    protocol: row.protocol || '',
    contribs: parseJson(row.contributions_json, []),
    project: parseJson(row.project_json, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  if (request) {
    work.shareUrl = `${new URL(request.url).origin}/api/works/${row.id}`;
  }
  return work;
}

function requireDb(env) {
  if (!env.DB) {
    throw new Error('D1 database is not configured');
  }
  return env.DB;
}

async function createAvatar(input, env) {
  const db = requireDb(env);
  const now = new Date().toISOString();
  const creatorId = clampText(input.creatorId, 'anonymous', 128);
  const tags = Array.isArray(input.tags) ? input.tags.map((item) => clampText(item, '', 40)).filter(Boolean).slice(0, 12) : [];
  const strengths = Array.isArray(input.strengths) ? input.strengths.map((item) => clampText(item, '', 40)).filter(Boolean).slice(0, 12) : [];
  const representativeWorks = Array.isArray(input.representativeWorks)
    ? input.representativeWorks.map((item) => clampText(item, '', 80)).filter(Boolean).slice(0, 12)
    : [];
  const styleWeights = input.styleWeights && typeof input.styleWeights === 'object'
    ? input.styleWeights
    : initialStyleWeights(tags, strengths);
  const row = {
    id: makeId('avatar'),
    creator_id: creatorId,
    name: clampText(input.name, '未命名分身', 40),
    dir: clampText(input.dir, '作词', 20),
    level: 1,
    calls: 0,
    adopt: 0,
    tags_json: JSON.stringify(tags),
    emoji: clampText(input.emoji, input.dir === '作曲' ? '🎼' : input.dir === '编曲' ? '🎸' : input.dir === '制作' ? '🎚️' : '✍️', 8),
    color: clampText(input.color, '#6366F1', 20),
    motto: clampText(input.motto, '先找到情绪转折点，再让作品说话。', 160),
    status: '自动发布 · 可被召唤',
    intro: clampText(input.intro, '', 600),
    method: clampText(input.method, '', 1000),
    avoid: clampText(input.avoid, '', 500),
    representative_works_json: JSON.stringify(representativeWorks),
    style_weights_json: JSON.stringify(styleWeights),
    created_at: now,
    updated_at: now,
  };

  await db.prepare(`INSERT INTO avatars (
    id, creator_id, name, dir, level, calls, adopt, tags_json, emoji, color,
    motto, status, intro, method, avoid, representative_works_json,
    style_weights_json, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      row.id, row.creator_id, row.name, row.dir, row.level, row.calls, row.adopt,
      row.tags_json, row.emoji, row.color, row.motto, row.status, row.intro,
      row.method, row.avoid, row.representative_works_json,
      row.style_weights_json, row.created_at, row.updated_at,
    )
    .run();

  return rowToAvatar(row);
}

async function listAvatars(creatorId, env) {
  const db = requireDb(env);
  const { results } = await db.prepare('SELECT * FROM avatars WHERE creator_id = ? ORDER BY created_at DESC')
    .bind(clampText(creatorId, 'anonymous', 128))
    .all();
  return results.map(rowToAvatar);
}

async function getAvatar(id, env) {
  const db = requireDb(env);
  return rowToAvatar(await db.prepare('SELECT * FROM avatars WHERE id = ?').bind(id).first());
}

function buildParameterChanges(avatar, input) {
  const answers = input.answers || {};
  const scores = input.scores || {};
  const changes = [];

  if (String(answers.interest || '').includes('电子国风')) {
    changes.push({ key: '电子国风', delta: 'new', to: 0.2, reason: '主人在校准中选择探索电子国风方向' });
  }
  if (String(answers.focus || '').includes('古风')) {
    const current = Number(avatar.styleWeights?.古风 || 0.72);
    changes.push({ key: '古风', delta: 0.1, from: current, to: Math.min(1, Number((current + 0.1).toFixed(2))), reason: '主人希望提升古风质量' });
  }
  const negativeScores = Object.values(scores).filter((value) => String(value).includes('完全不是我')).length;
  if (negativeScores > 0) {
    changes.push({ key: '人格保真约束', delta: 'add', reason: '校准中出现不像本人的样本，增加保真约束' });
  }
  if (changes.length === 0) {
    changes.push({ key: '稳定性', delta: 0.03, reason: '校准完成，轻微增强当前主风格稳定性' });
  }
  return changes;
}

function applyParameterChanges(styleWeights, changes) {
  const next = { ...(styleWeights || {}) };
  changes.forEach((change) => {
    if (typeof change.to === 'number') {
      next[change.key] = change.to;
    } else if (change.delta === 'new') {
      next[change.key] = 0.2;
    }
  });
  return next;
}

async function createCalibration(avatarId, input, env) {
  const db = requireDb(env);
  const avatar = await getAvatar(avatarId, env);
  if (!avatar) {
    const error = new Error('Avatar not found');
    error.status = 404;
    throw error;
  }
  const now = new Date().toISOString();
  const creatorId = clampText(input.creatorId, avatar.creatorId, 128);
  const parameterChanges = buildParameterChanges(avatar, input);
  const nextWeights = applyParameterChanges(avatar.styleWeights, parameterChanges);
  const calibration = {
    id: makeId('calibration'),
    avatar_id: avatarId,
    creator_id: creatorId,
    scores_json: JSON.stringify(input.scores || {}),
    answers_json: JSON.stringify(input.answers || {}),
    parameter_changes_json: JSON.stringify(parameterChanges),
    created_at: now,
  };

  await db.prepare(`INSERT INTO avatar_calibrations (
    id, avatar_id, creator_id, scores_json, answers_json, parameter_changes_json, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      calibration.id, calibration.avatar_id, calibration.creator_id,
      calibration.scores_json, calibration.answers_json,
      calibration.parameter_changes_json, calibration.created_at,
    )
    .run();

  await db.prepare('UPDATE avatars SET name = ?, motto = ?, intro = ?, style_weights_json = ?, status = ?, updated_at = ? WHERE id = ?')
    .bind(avatar.name, avatar.motto, avatar.intro, JSON.stringify(nextWeights), '状态良好', now, avatarId)
    .run();

  return {
    avatar: { ...avatar, styleWeights: nextWeights, status: '状态良好', updatedAt: now },
    calibration: rowToCalibration(calibration),
  };
}

async function listCalibrations(avatarId, env) {
  const db = requireDb(env);
  const { results } = await db.prepare('SELECT * FROM avatar_calibrations WHERE avatar_id = ? ORDER BY created_at DESC')
    .bind(avatarId)
    .all();
  return results.map(rowToCalibration);
}

function normalizeWorkStatus(status) {
  return ['done', 'active', 'draft'].includes(status) ? status : 'done';
}

function sanitizeContributionList(value) {
  return Array.isArray(value)
    ? value.map((item) => ({
      step: clampText(item?.step, '', 20),
      avatar: clampText(item?.avatar, '', 80),
      lv: Number(item?.lv || 1),
      w: Number(item?.w || 0),
      output: clampText(item?.output, '', 500),
      edit: clampText(item?.edit, '', 240),
      at: clampText(item?.at, '', 40),
      adopt: Number(item?.adopt || 0),
    })).filter((item) => item.step && item.avatar).slice(0, 12)
    : [];
}

async function createWork(input, env, request) {
  const db = requireDb(env);
  const now = new Date().toISOString();
  const tags = Array.isArray(input.tags) ? input.tags.map((item) => clampText(item, '', 40)).filter(Boolean).slice(0, 12) : [];
  const contributions = sanitizeContributionList(input.contribs || input.contributions);
  const project = input.project && typeof input.project === 'object' ? input.project : {};
  const row = {
    id: makeId('work'),
    creator_id: clampText(input.creatorId, 'anonymous', 128),
    title: clampText(input.title || project.title, '未命名作品', 80),
    status: normalizeWorkStatus(input.status),
    color: clampText(input.color, '#4F46E5', 20),
    tags_json: JSON.stringify(tags),
    seed: Number(input.seed || 23),
    steps_done: Math.max(0, Math.min(4, Number(input.stepsDone ?? 4))),
    progress: Math.max(0, Math.min(1, Number(input.progress ?? 1))),
    desc: clampText(input.desc, '已生成 Demo · 四步完成', 160),
    plays: Math.max(0, Number(input.plays || 0)),
    likes: Math.max(0, Number(input.likes || 0)),
    shares: Math.max(0, Number(input.shares || 0)),
    completion: Math.max(0, Math.min(100, Number(input.completion || 0))),
    earnings: Math.max(0, Number(input.earnings || 0)),
    duration: clampText(input.duration, '3:38', 40),
    audio_url: clampText(input.audioUrl, '', 2000),
    generation_source: clampText(input.generationSource, '', 80),
    final_prompt: clampText(input.finalPrompt, '', 2400),
    lyrics: clampText(input.lyrics, '', 6000),
    protocol: clampText(input.protocol, '', 40),
    contributions_json: JSON.stringify(contributions),
    project_json: JSON.stringify(project),
    created_at: now,
    updated_at: now,
  };

  await db.prepare(`INSERT INTO works (
    id, creator_id, title, status, color, tags_json, seed, steps_done,
    progress, desc, plays, likes, shares, completion, earnings,
    duration, audio_url, generation_source, final_prompt, lyrics,
    protocol, contributions_json, project_json, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      row.id, row.creator_id, row.title, row.status, row.color, row.tags_json,
      row.seed, row.steps_done, row.progress, row.desc, row.plays, row.likes,
      row.shares, row.completion, row.earnings, row.duration, row.audio_url,
      row.generation_source, row.final_prompt, row.lyrics, row.protocol,
      row.contributions_json, row.project_json, row.created_at, row.updated_at,
    )
    .run();

  return rowToWork(row, request);
}

async function listWorks(creatorId, env, request) {
  const db = requireDb(env);
  const { results } = await db.prepare('SELECT * FROM works WHERE creator_id = ? ORDER BY created_at DESC')
    .bind(clampText(creatorId, 'anonymous', 128))
    .all();
  return results.map((row) => rowToWork(row, request));
}

async function listPublicWorks(env, request) {
  const db = requireDb(env);
  const { results } = await db.prepare("SELECT * FROM works WHERE status = 'done' ORDER BY created_at DESC LIMIT 100").all();
  return results.map((row) => rowToWork(row, request));
}

async function getWork(id, env, request) {
  const db = requireDb(env);
  return rowToWork(await db.prepare('SELECT * FROM works WHERE id = ?').bind(id).first(), request);
}

export function buildStepPrompt(input = {}) {
  const project = input.project || {};
  const avatar = input.avatar || {};
  const previous = Array.isArray(input.previousContributions) ? input.previousContributions : [];
  return [
    '你是 MuseGrid 的音乐创作分身后端。请根据项目、当前环节、分身人格和上游贡献，生成结构化交付。',
    '只输出 JSON，不要 Markdown，不要解释。JSON 字段必须包括：stepLabel, summary, blocks, lyrics, prompt, confidence, styleSignature。',
    'blocks 是数组，每项包含 label 和 value。lyrics 只在作词环节输出完整歌词，其他环节可为空。prompt 是给后续音乐模型的英文/中英混合风格提示。',
    `当前环节：${STEP_LABELS[input.stepIndex] || '创作'}`,
    `项目标题：${project.title || ''}`,
    `创作灵感：${project.idea || ''}`,
    `语言/风格/情绪：${project.language || '中文'} / ${project.genre || ''} / ${project.mood || ''}`,
    `分身：${avatar.name || ''}，方向：${avatar.dir || ''}，格言：${avatar.motto || ''}`,
    `分身简介：${avatar.intro || ''}`,
    `分身方法：${avatar.method || ''}`,
    `分身禁区：${avatar.avoid || ''}`,
    `代表作品：${JSON.stringify(avatar.representativeWorks || avatar.reps || []).slice(0, 500)}`,
    `风格权重：${JSON.stringify(avatar.styleWeights || {}).slice(0, 800)}`,
    `上游贡献：${JSON.stringify(previous.map((item) => ({ step: item.step, avatar: item.avatar, output: item.output, styleSignature: item.styleSignature }))).slice(0, 2600)}`,
    '风格指纹要求：必须返回 styleSignature，包含 headline, tags, dimensions, downstreamImpact, promptTraits。dimensions 每项包含 key, label, value, text。它要说明这个分身版本会如何改变后续作曲、编曲、制作，不允许只写泛泛风格词。',
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
        { role: 'system', name: 'MuseGrid', content: '你是专业音乐制作协作系统，擅长歌词、作曲、编曲和制作交付。输出必须是严格 JSON，不要 Markdown。字段内容要短，summary 不超过 120 字，blocks 最多 6 项，每项 value 不超过 90 字，必须包含 styleSignature，确保 JSON 可解析。' },
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

async function callMiniMaxMusic(input, env, request) {
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
  const output = {
    ...makeFallbackMusicOutput(input),
    source: 'minimax_music',
    status: data?.data?.status === 2 ? 'done' : 'processing',
    audioUrl: data?.data?.audio || '',
    duration: data?.extra_info?.music_duration ? `${Math.round(data.extra_info.music_duration / 1000)}s` : '生成完成',
    message: '真实音频已由 MiniMax 返回。URL 可能会过期，请及时保存。',
    minimaxTraceId: data?.trace_id || '',
  };

  if (output.audioUrl && (env.AUDIO_BUCKET || env.AUDIO_KV)) {
    return persistMusicOutput(output, env, request);
  }

  return output;
}

async function persistMusicOutput(output, env, request) {
  try {
    const audioResponse = await fetch(output.audioUrl);
    if (!audioResponse.ok) {
      return {
        ...output,
        message: `${output.message} 音频转存失败：下载返回 ${audioResponse.status}。`,
      };
    }
    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg';
    const audioBytes = await audioResponse.arrayBuffer();
    const traceId = output.minimaxTraceId || makeId('audio');
    const filename = `${traceId}.mp3`;
    const key = `generated/${filename}`;
    if (env.AUDIO_BUCKET) {
      await env.AUDIO_BUCKET.put(key, audioBytes, {
        httpMetadata: {
          contentType,
          cacheControl: 'public, max-age=31536000',
        },
        customMetadata: {
          source: output.source,
          minimaxTraceId: output.minimaxTraceId || '',
          createdAt: new Date().toISOString(),
        },
      });
    } else {
      await env.AUDIO_KV.put(key, audioBytes, {
        metadata: {
          contentType,
          source: output.source,
          minimaxTraceId: output.minimaxTraceId || '',
          createdAt: new Date().toISOString(),
        },
      });
    }
    return {
      ...output,
      audioUrl: `${new URL(request.url).origin}/api/audio/${filename}`,
      storedAudioKey: key,
      message: '真实音频已生成并保存，可长期播放。',
    };
  } catch (error) {
    return {
      ...output,
      message: `${output.message} 音频转存失败：${error instanceof Error ? error.message : '未知错误'}。`,
    };
  }
}

function audioFileName(filename = 'musegrid-demo.mp3') {
  const clean = String(filename || 'musegrid-demo.mp3')
    .split('/')
    .pop()
    .replace(/[^a-zA-Z0-9._-]/g, '-') || 'musegrid-demo.mp3';
  return clean.toLowerCase().endsWith('.mp3') ? clean : `${clean}.mp3`;
}

function shouldDownloadAudio(request) {
  return new URL(request.url).searchParams.get('download') === '1';
}

function applyAudioDownloadHeaders(headers, request, filename) {
  if (shouldDownloadAudio(request)) {
    headers.set('content-disposition', `attachment; filename="${audioFileName(filename)}"`);
    headers.set('cache-control', 'private, max-age=0, must-revalidate');
  }
}

function audioResponse(object, request, env, filename) {
  const headers = new Headers(corsHeaders(request, env));
  object.writeHttpMetadata?.(headers);
  if (!headers.has('content-type')) {
    headers.set('content-type', object.httpMetadata?.contentType || 'audio/mpeg');
  }
  headers.set('cache-control', object.httpMetadata?.cacheControl || 'public, max-age=31536000');
  headers.set('accept-ranges', 'bytes');
  applyAudioDownloadHeaders(headers, request, filename);
  return new Response(object.body, { headers });
}

function audioBytesResponse(bytes, metadata, request, env, filename) {
  const headers = new Headers(corsHeaders(request, env));
  headers.set('content-type', metadata?.contentType || 'audio/mpeg');
  headers.set('cache-control', 'public, max-age=31536000');
  headers.set('accept-ranges', 'bytes');
  applyAudioDownloadHeaders(headers, request, filename);
  return new Response(bytes, { headers });
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
      audioStorage: Boolean(env.AUDIO_BUCKET || env.AUDIO_KV),
      time: new Date().toISOString(),
    }, {}, request, env);
  }

  if (request.method !== 'POST') {
    try {
      const audioMatch = url.pathname.match(/^\/api\/audio\/([^/]+)$/);
      if (request.method === 'GET' && audioMatch) {
        if (!env.AUDIO_BUCKET && !env.AUDIO_KV) {
          return json({ error: 'Audio bucket is not configured' }, { status: 501 }, request, env);
        }
        const key = `generated/${audioMatch[1]}`;
        if (env.AUDIO_BUCKET) {
          const object = await env.AUDIO_BUCKET.get(key);
          if (!object) {
            return json({ error: 'Audio not found' }, { status: 404 }, request, env);
          }
          return audioResponse(object, request, env, audioMatch[1]);
        }
        const kvObject = await env.AUDIO_KV.getWithMetadata(key, 'arrayBuffer');
        if (!kvObject?.value) {
          return json({ error: 'Audio not found' }, { status: 404 }, request, env);
        }
        return audioBytesResponse(kvObject.value, kvObject.metadata, request, env, audioMatch[1]);
      }
      if (request.method === 'GET' && url.pathname === '/api/avatars') {
        const creatorId = url.searchParams.get('creatorId') || 'anonymous';
        return json({ ok: true, avatars: await listAvatars(creatorId, env) }, {}, request, env);
      }
      if (request.method === 'GET' && url.pathname === '/api/works') {
        if (url.searchParams.get('scope') === 'public') {
          return json({ ok: true, works: await listPublicWorks(env, request) }, {}, request, env);
        }
        const creatorId = url.searchParams.get('creatorId') || 'anonymous';
        return json({ ok: true, works: await listWorks(creatorId, env, request) }, {}, request, env);
      }
      const workReadMatch = url.pathname.match(/^\/api\/works\/([^/]+)$/);
      if (request.method === 'GET' && workReadMatch) {
        const work = await getWork(workReadMatch[1], env, request);
        if (!work) {
          return json({ error: 'Work not found' }, { status: 404 }, request, env);
        }
        return json({ ok: true, work }, {}, request, env);
      }
      const calibrationListMatch = url.pathname.match(/^\/api\/avatars\/([^/]+)\/calibrations$/);
      if (request.method === 'GET' && calibrationListMatch) {
        return json({ ok: true, calibrations: await listCalibrations(calibrationListMatch[1], env) }, {}, request, env);
      }
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: error.status || 400 }, request, env);
    }
    return json({ error: 'Not found' }, { status: 404 }, request, env);
  }

  const rate = checkRateLimit(request, env);
  if (!rate.ok) {
    return json({ error: 'Rate limit exceeded', resetAt: rate.resetAt }, { status: 429 }, request, env);
  }

  try {
    const input = await readJson(request);
    if (url.pathname === '/api/avatars') {
      return json({ ok: true, avatar: await createAvatar(input, env) }, {}, request, env);
    }
    if (url.pathname === '/api/works') {
      return json({ ok: true, work: await createWork(input, env, request) }, {}, request, env);
    }
    const calibrationCreateMatch = url.pathname.match(/^\/api\/avatars\/([^/]+)\/calibrations$/);
    if (calibrationCreateMatch) {
      const result = await createCalibration(calibrationCreateMatch[1], input, env);
      return json({ ok: true, ...result }, {}, request, env);
    }
    if (url.pathname === '/api/generate-step') {
      const output = await callMiniMaxText(input, env);
      return json({ ok: true, output, rate }, {}, request, env);
    }
    if (url.pathname === '/api/generate-music') {
      const musicRate = checkMusicRateLimit(request, env);
      if (!musicRate.ok) {
        return json({ error: 'Music rate limit exceeded', resetAt: musicRate.resetAt }, { status: 429 }, request, env);
      }
      const output = await callMiniMaxMusic(input, env, request);
      return json({ ok: true, output, rate, musicRate }, {}, request, env);
    }
    return json({ error: 'Not found' }, { status: 404 }, request, env);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 }, request, env);
  }
}

export default {
  fetch: handleRequest,
};
