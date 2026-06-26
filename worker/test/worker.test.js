import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { buildStepPrompt, extractJsonObject, makeFallbackMusicOutput, makeFallbackStepOutput } from '../src/index.js';

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

test('worker generate-step uses official MiniMax text endpoint and falls back on business errors', async () => {
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
    assert.equal(calls[0].url, 'https://api.minimax.io/v1/text/chatcompletion_v2');
    assert.equal(data.output.source, 'mock_after_minimax_error');
    assert.equal(data.output.error, 'mock business error');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
