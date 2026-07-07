const { chromium } = require('playwright');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:4325/';

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.addInitScript(() => {
    window.__audioPlayCalls = 0;
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function patchedPlay() {
      window.__audioPlayCalls += 1;
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function patchedPause() {};
    window.__restoreAudioPlay = () => { HTMLMediaElement.prototype.play = originalPlay; };
  });
  await page.reload({ waitUntil: 'networkidle' });

  await page.getByText('我的作品', { exact: true }).click();
  await page.getByText('山海之旅', { exact: true }).click();
  await page.waitForTimeout(300);

  const workPlayButton = page.getByRole('button', { name: /播放山海之旅/ });
  assert(await workPlayButton.count() === 1, 'work detail should expose a primary play button for the current work');
  await workPlayButton.click();
  await page.waitForTimeout(200);
  const bottomTrack = await page.getByTestId('bottom-player-track-title').innerText();
  assert(bottomTrack.includes('山海之旅'), `bottom player should load the clicked work, got ${bottomTrack}`);
  const missingAudioNotice = await page.locator('body').innerText();
  assert(missingAudioNotice.includes('暂无真实音频'), 'mock works without audioUrl should clearly explain that no real audio can play');

  const timeMetrics = await page.getByTestId('bottom-player-time').evaluate((node) => {
    const rect = node.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      scrollWidth: node.scrollWidth,
      text: node.textContent,
    };
  });
  assert(timeMetrics.height <= 18, `bottom player time should stay on one line, got height ${timeMetrics.height}`);
  assert(timeMetrics.scrollWidth <= Math.ceil(timeMetrics.width) + 1, `bottom player time should not be clipped: ${timeMetrics.text}`);

  await page.getByRole('button', { name: '播放列表' }).click();
  await page.waitForTimeout(200);
  const body = await page.locator('body').innerText();
  assert(body.includes('播放队列'), 'playlist button should open the playback queue');
  assert(body.includes('山海之旅'), 'playback queue should show available works');

  await page.evaluate(() => {
    const work = {
      id: 'audio-test-work',
      title: '真实音频测试',
      status: 'done',
      color: '#4F46E5',
      tags: ['测试'],
      seed: 99,
      stepsDone: 4,
      progress: 1,
      desc: '真实音频',
      plays: 0,
      likes: 0,
      shares: 0,
      completion: 0,
      earnings: 0,
      duration: '0:30',
      audioUrl: 'https://example.com/test.mp3',
      generationSource: 'minimax_music',
      finalPrompt: 'test',
      lyrics: 'test',
      protocol: '',
      contribs: [],
    };
    const snapshot = JSON.parse(localStorage.getItem('musegrid.v2.snapshot') || '{}');
    snapshot.works = [work, ...(snapshot.works || [])];
    snapshot.activeWorkId = work.id;
    localStorage.setItem('musegrid.v2.snapshot', JSON.stringify(snapshot));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('我的作品', { exact: true }).click();
  await page.getByRole('button', { name: /播放真实音频测试/ }).first().click();
  await page.waitForTimeout(300);
  const audioState = await page.evaluate(() => ({
    audioCount: document.querySelectorAll('audio[data-testid="bottom-player-audio"]').length,
    playCalls: window.__audioPlayCalls,
    src: document.querySelector('audio[data-testid="bottom-player-audio"]')?.getAttribute('src') || '',
  }));
  assert(audioState.audioCount === 1, `bottom player should mount one audio element, got ${audioState.audioCount}`);
  assert(audioState.src.includes('https://example.com/test.mp3'), `audio element should use work audioUrl, got ${audioState.src}`);
  assert(audioState.playCalls >= 1, `clicking a real audio work should call audio.play(), got ${audioState.playCalls}`);

  const liveIndicator = page.getByTestId('bottom-player-live-indicator');
  assert(await liveIndicator.isVisible(), 'playing audio should show an obvious live playback indicator');
  const liveText = await liveIndicator.innerText();
  assert(liveText.includes('正在播放'), `live playback indicator should say it is playing, got ${liveText}`);
  const eqBars = await page.getByTestId('bottom-player-live-eq').locator('[data-testid="bottom-player-live-eq-bar"]').count();
  assert(eqBars >= 5, `playing audio should show animated equalizer bars, got ${eqBars}`);

  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
