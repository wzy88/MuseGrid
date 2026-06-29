import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { buildStepPrompt, extractJsonObject, makeFallbackMusicOutput, makeFallbackStepOutput } from '../src/index.js';

function createFakeD1() {
  const avatars = new Map();
  const calibrations = new Map();
  return {
    prepare(sql) {
      const statement = {
        bindings: [],
        bind(...values) {
          this.bindings = values;
          return this;
        },
        async all() {
          if (sql.includes('FROM avatars')) {
            const creatorId = this.bindings[0];
            return {
              results: [...avatars.values()]
                .filter((row) => row.creator_id === creatorId)
                .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))),
            };
          }
          if (sql.includes('FROM avatar_calibrations')) {
            const avatarId = this.bindings[0];
            return {
              results: [...calibrations.values()]
                .filter((row) => row.avatar_id === avatarId)
                .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))),
            };
          }
          return { results: [] };
        },
        async first() {
          if (sql.includes('FROM avatars')) {
            const id = this.bindings[0];
            return avatars.get(id) || null;
          }
          return null;
        },
        async run() {
          if (sql.startsWith('INSERT INTO avatars')) {
            const [
              id, creator_id, name, dir, level, calls, adopt, tags_json, emoji, color,
              motto, status, intro, method, avoid, representative_works_json,
              style_weights_json, created_at, updated_at,
            ] = this.bindings;
            avatars.set(id, {
              id, creator_id, name, dir, level, calls, adopt, tags_json, emoji, color,
              motto, status, intro, method, avoid, representative_works_json,
              style_weights_json, created_at, updated_at,
            });
          }
          if (sql.startsWith('UPDATE avatars')) {
            const [name, motto, intro, style_weights_json, status, updated_at, id] = this.bindings;
            const current = avatars.get(id);
            avatars.set(id, { ...current, name, motto, intro, style_weights_json, status, updated_at });
          }
          if (sql.startsWith('INSERT INTO avatar_calibrations')) {
            const [id, avatar_id, creator_id, scores_json, answers_json, parameter_changes_json, created_at] = this.bindings;
            calibrations.set(id, { id, avatar_id, creator_id, scores_json, answers_json, parameter_changes_json, created_at });
          }
          return { success: true };
        },
      };
      return statement;
    },
  };
}

function createFakeR2() {
  const objects = new Map();
  return {
    objects,
    async put(key, body, options = {}) {
      const bytes = body instanceof ArrayBuffer ? body : await new Response(body).arrayBuffer();
      objects.set(key, {
        body: bytes,
        httpMetadata: options.httpMetadata || {},
        customMetadata: options.customMetadata || {},
      });
      return { key };
    },
    async get(key) {
      const object = objects.get(key);
      if (!object) return null;
      return {
        key,
        httpMetadata: object.httpMetadata,
        customMetadata: object.customMetadata,
        body: new Blob([object.body]),
      };
    },
  };
}

test('fallback step output includes structured lyrics for lyric step', () => {
  const output = makeFallbackStepOutput({
    stepIndex: 0,
    project: { title: '雨夜列车', idea: '旧友重逢', genre: '电子国风', mood: '温柔遗憾' },
    avatar: { name: '林间小调', dir: '作词' },
  });

  assert.equal(output.stepLabel, '作词');
  assert.equal(output.source, 'mock');
  assert.ok(output.summary.includes('雨夜列车'));
  assert.ok(output.blocks.length >= 4);
  assert.ok(output.lyrics.includes('雨夜列车'));
});

test('buildStepPrompt carries project, avatar, contribution and feedback context', () => {
  const prompt = buildStepPrompt({
    stepIndex: 2,
    project: { title: '城市夜语', idea: '城市夜晚', language: '中文', genre: 'R&B', mood: '克制' },
    avatar: { name: '声纹织造', dir: '编曲', motto: '层次感是灵魂' },
    previousContributions: [{ step: '作词', avatar: '林间小调', output: '歌词初稿' }],
    feedback: '鼓组更强一点',
  });

  assert.ok(prompt.includes('当前环节：编曲'));
  assert.ok(prompt.includes('城市夜语'));
  assert.ok(prompt.includes('声纹织造'));
  assert.ok(prompt.includes('歌词初稿'));
  assert.ok(prompt.includes('鼓组更强一点'));
});

test('extractJsonObject parses strict JSON and fenced-looking text', () => {
  assert.deepEqual(extractJsonObject('{"summary":"ok"}'), { summary: 'ok' });
  assert.deepEqual(extractJsonObject('前缀\n{"summary":"ok","blocks":[]}\n后缀'), { summary: 'ok', blocks: [] });
});

test('music output stays mocked unless music generation is explicitly enabled', () => {
  const output = makeFallbackMusicOutput({
    project: { title: '梦中之旅', genre: '古风流行', mood: '温暖' },
    prompt: 'warm vocal',
  });

  assert.equal(output.source, 'mock');
  assert.equal(output.status, 'mock_ready');
  assert.equal(output.audioUrl, '');
  assert.ok(output.message.includes('MiniMax'));
});

test('worker applies a stricter rate limit to music generation', async () => {
  const env = {
    MINIMAX_ENABLE_MUSIC: 'true',
    MUSIC_RATE_LIMIT_PER_HOUR: '1',
  };
  const request = () => new Request('https://example.com/api/generate-music', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cf-connecting-ip': '203.0.113.9',
    },
    body: JSON.stringify({
      project: { title: '雨夜列车', genre: '电子国风', mood: '遗憾' },
      prompt: 'electronic guofeng',
      lyrics: '测试歌词',
    }),
  });

  const first = await worker.fetch(request(), env);
  const second = await worker.fetch(request(), env);
  const data = await second.json();

  assert.equal(first.status, 200);
  assert.equal(second.status, 429);
  assert.equal(data.error, 'Music rate limit exceeded');
});

test('worker persists MiniMax music audio to R2 and serves it through audio endpoint', async () => {
  const originalFetch = globalThis.fetch;
  const audioBytes = new Uint8Array([1, 2, 3, 4]).buffer;
  const r2 = createFakeR2();

  globalThis.fetch = async (url) => {
    if (String(url).includes('/v1/music_generation')) {
      return new Response(JSON.stringify({
        base_resp: { status_code: 0, status_msg: '' },
        trace_id: 'trace-r2-test',
        data: {
          status: 2,
          audio: 'https://minimax.example/audio/temp.mp3',
        },
        extra_info: { music_duration: 31000 },
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (String(url) === 'https://minimax.example/audio/temp.mp3') {
      return new Response(audioBytes, {
        status: 200,
        headers: { 'content-type': 'audio/mpeg' },
      });
    }
    throw new Error(`unexpected fetch ${url}`);
  };

  try {
    const response = await worker.fetch(new Request('https://example.com/api/generate-music', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'cf-connecting-ip': '198.51.100.7',
      },
      body: JSON.stringify({
        project: { title: '雨夜列车', genre: '电子国风', mood: '遗憾' },
        prompt: 'electronic guofeng',
        lyrics: '测试歌词',
      }),
    }), {
      MINIMAX_API_KEY: 'test-key',
      MINIMAX_ENABLE_MUSIC: 'true',
      MUSIC_RATE_LIMIT_PER_HOUR: '3',
      AUDIO_BUCKET: r2,
    });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.output.source, 'minimax_music');
    assert.equal(data.output.audioUrl, 'https://example.com/api/audio/trace-r2-test.mp3');
    assert.equal(data.output.storedAudioKey, 'generated/trace-r2-test.mp3');
    assert.equal(r2.objects.size, 1);

    const audioResponse = await worker.fetch(new Request(data.output.audioUrl), {
      AUDIO_BUCKET: r2,
    });
    assert.equal(audioResponse.status, 200);
    assert.equal(audioResponse.headers.get('content-type'), 'audio/mpeg');
    assert.deepEqual(new Uint8Array(await audioResponse.arrayBuffer()), new Uint8Array([1, 2, 3, 4]));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('worker health endpoint reports service state', async () => {
  const response = await worker.fetch(new Request('https://example.com/health'), {});
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.service, 'musegrid-worker');
  assert.equal(data.minimaxText, false);
});

test('worker generate-step endpoint returns fallback without MiniMax credentials', async () => {
  const response = await worker.fetch(new Request('https://example.com/api/generate-step', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      stepIndex: 1,
      project: { title: '雨夜列车', idea: '雨夜旧友', genre: '电子国风', mood: '遗憾' },
      avatar: { name: 'Ray·节奏', dir: '作曲' },
    }),
  }), {});
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.output.stepLabel, '作曲');
  assert.equal(data.output.source, 'mock');
});

test('worker generate-step uses default MiniMax text endpoint and falls back on business errors', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({
      base_resp: { status_code: 1001, status_msg: 'mock business error' },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    const response = await worker.fetch(new Request('https://example.com/api/generate-step', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        stepIndex: 0,
        project: { title: '雨夜列车', idea: '雨夜旧友', genre: '电子国风', mood: '遗憾' },
        avatar: { name: '林间小调', dir: '作词' },
      }),
    }), { MINIMAX_API_KEY: 'test-key' });
    const data = await response.json();

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.minimaxi.com/v1/text/chatcompletion_v2');
    assert.equal(data.output.source, 'mock_after_minimax_error');
    assert.equal(data.output.error, 'mock business error');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('worker generate-step uses configured MiniMax API host', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({
      base_resp: { status_code: 1001, status_msg: 'mock business error' },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    await worker.fetch(new Request('https://example.com/api/generate-step', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        stepIndex: 0,
        project: { title: '雨夜列车', idea: '雨夜旧友', genre: '电子国风', mood: '遗憾' },
        avatar: { name: '林间小调', dir: '作词' },
      }),
    }), {
      MINIMAX_API_KEY: 'test-key',
      MINIMAX_API_HOST: 'https://api.minimaxi.com',
    });

    assert.equal(calls[0].url, 'https://api.minimaxi.com/v1/text/chatcompletion_v2');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('worker generate-step gives MiniMax enough room for structured music output', async () => {
  const originalFetch = globalThis.fetch;
  let requestBody = null;
  globalThis.fetch = async (_url, init) => {
    requestBody = JSON.parse(init.body);
    return new Response(JSON.stringify({
      base_resp: { status_code: 0, status_msg: '' },
      choices: [{
        message: {
          content: JSON.stringify({
            stepLabel: '作词',
            summary: 'ok',
            blocks: [{ label: '方向', value: '稳定 JSON 输出' }],
            lyrics: '歌词',
            prompt: 'prompt',
            confidence: 0.9,
          }),
        },
      }],
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    const response = await worker.fetch(new Request('https://example.com/api/generate-step', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        stepIndex: 0,
        project: { title: '雨夜列车', idea: '雨夜旧友', genre: '电子国风', mood: '遗憾' },
        avatar: { name: '林间小调', dir: '作词' },
      }),
    }), { MINIMAX_API_KEY: 'test-key' });
    const data = await response.json();

    assert.equal(data.output.source, 'minimax_text');
    assert.equal(requestBody.max_completion_tokens, 3200);
    assert.ok(requestBody.messages[0].content.includes('字段内容要短'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('worker keeps MiniMax unstructured content instead of discarding it', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    base_resp: { status_code: 0, status_msg: '' },
    choices: [{
      message: {
        content: '《雨夜列车》歌词方案：主歌写旧车站和雨声，副歌用“下一站仍是你”收束。\\n\\n【主歌】雨落在站台玻璃\\n【副歌】下一站仍是你',
      },
    }],
  }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

  try {
    const response = await worker.fetch(new Request('https://example.com/api/generate-step', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        stepIndex: 0,
        project: { title: '雨夜列车', idea: '雨夜旧友', genre: '电子国风', mood: '遗憾' },
        avatar: { name: '林间小调', dir: '作词' },
      }),
    }), { MINIMAX_API_KEY: 'test-key' });
    const data = await response.json();

    assert.equal(data.output.source, 'minimax_text_unstructured');
    assert.ok(data.output.summary.includes('雨夜列车'));
    assert.ok(data.output.blocks[0].value.includes('下一站仍是你'));
    assert.ok(data.output.lyrics.includes('主歌'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('worker creates and lists creator avatars through D1', async () => {
  const env = { DB: createFakeD1() };
  const createResponse = await worker.fetch(new Request('https://example.com/api/avatars', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      creatorId: 'creator-1',
      name: '夜航写词人',
      dir: '作词',
      tags: ['电子国风', '情感叙事'],
      motto: '先找到情绪转折点。',
      representativeWorks: ['雨夜列车'],
      method: '先写 Hook，再展开故事线。',
    }),
  }), env);
  const created = await createResponse.json();

  assert.equal(createResponse.status, 200);
  assert.equal(created.ok, true);
  assert.equal(created.avatar.name, '夜航写词人');
  assert.equal(created.avatar.creatorId, 'creator-1');
  assert.deepEqual(created.avatar.tags, ['电子国风', '情感叙事']);
  assert.equal(created.avatar.level, 1);

  const listResponse = await worker.fetch(new Request('https://example.com/api/avatars?creatorId=creator-1'), env);
  const list = await listResponse.json();

  assert.equal(list.ok, true);
  assert.equal(list.avatars.length, 1);
  assert.equal(list.avatars[0].id, created.avatar.id);
});

test('worker records avatar calibrations and updates style weights', async () => {
  const env = { DB: createFakeD1() };
  const created = await (await worker.fetch(new Request('https://example.com/api/avatars', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      creatorId: 'creator-1',
      name: '夜航写词人',
      dir: '作词',
      tags: ['古风'],
      motto: '先找到情绪转折点。',
    }),
  }), env)).json();

  const response = await worker.fetch(new Request(`https://example.com/api/avatars/${created.avatar.id}/calibrations`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      creatorId: 'creator-1',
      scores: { sample1: '这就是我会写的' },
      answers: { interest: '开始对电子国风感兴趣' },
    }),
  }), env);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.calibration.avatarId, created.avatar.id);
  assert.ok(data.calibration.parameterChanges.some((item) => item.key === '电子国风'));
  assert.equal(data.avatar.styleWeights['电子国风'], 0.2);

  const history = await (await worker.fetch(new Request(`https://example.com/api/avatars/${created.avatar.id}/calibrations`), env)).json();
  assert.equal(history.ok, true);
  assert.equal(history.calibrations.length, 1);
});
