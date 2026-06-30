import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, ListMusic } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { C } from '../../design/tokens';
import type { GeneratedWork } from '../../state/mockProject';

type PlayerTrack = {
  title: string;
  meta: string;
  duration: string;
  color: string;
  seed: number;
};

const BARS = Array.from({ length: 56 }, (_, i) => {
  const v = 0.15 + Math.abs(Math.sin(i * 0.72) * 0.45 + Math.sin(i * 1.6) * 0.25 + Math.sin(i * 3.1) * 0.1);
  return Math.min(1, Math.max(0.08, v));
});

function trackFromWork(work?: GeneratedWork | null): PlayerTrack {
  return {
    title: work?.title || '梦中之旅',
    meta: work ? `${work.tags[0] || '音乐'} · ${work.status === 'done' ? 'Demo' : '制作中'}` : '古风流行 · Demo v2',
    duration: work?.duration || '3:47',
    color: work?.color || '#6366F1',
    seed: Number(work?.seed ?? 5),
  };
}

export function BottomPlayer({ currentWork = null, queue = [], playing: controlledPlaying, onTogglePlay }: { currentWork?: GeneratedWork | null; queue?: GeneratedWork[]; playing?: boolean; onTogglePlay?: () => void }) {
  const [localPlaying, setLocalPlaying] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progress = 0.35;
  const playing = controlledPlaying ?? localPlaying;
  const currentTrack = trackFromWork(currentWork);
  const audioUrl = currentWork?.audioUrl || '';
  const hasAudio = Boolean(audioUrl);
  const queueTracks = (queue.length ? queue : []).filter((work) => work.status === 'done');
  const visibleQueue = queueTracks.length ? queueTracks : [
    { id: 'fallback-1', title: '山海之旅', tags: ['古风流行'], duration: '3:47', status: 'done' },
    { id: 'fallback-2', title: '夏末路口', tags: ['古风流行'], duration: '3:47', status: 'done' },
    { id: 'fallback-3', title: '城市夜语', tags: ['R&B'], duration: '制作中', status: 'active' },
  ] as GeneratedWork[];

  function togglePlay() {
    if (onTogglePlay) onTogglePlay();
    else setLocalPlaying((value) => !value);
  }

  useEffect(() => {
    setAudioError('');
    if (!audioRef.current || !hasAudio) return;
    audioRef.current.load();
  }, [audioUrl, hasAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    if (playing) {
      audio.play().catch((error) => {
        setAudioError(error instanceof Error ? error.message : '音频播放失败');
      });
    } else {
      audio.pause();
    }
  }, [playing, hasAudio, audioUrl]);

  return (
    <footer style={{
      height: 60, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px',
      background: 'rgba(6,7,15,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
      zIndex: 20,
    }}>
      {hasAudio && (
        <audio
          ref={audioRef}
          data-testid="bottom-player-audio"
          src={audioUrl}
          preload="metadata"
          onError={() => setAudioError('音频加载失败，请稍后再试')}
          onEnded={() => {
            if (onTogglePlay && playing) onTogglePlay();
            else setLocalPlaying(false);
          }}
        />
      )}
      {/* Track info */}
      <div style={{ width: 200, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: `linear-gradient(135deg, ${currentTrack.color}AA 0%, ${currentTrack.color} 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: playing ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
          transition: 'box-shadow 0.3s',
        }}>
          <span style={{ fontSize: 16 }}>🎵</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <p data-testid="bottom-player-track-title" style={{ color: C.t0, fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentTrack.title}
          </p>
          <p style={{ color: C.t3, fontSize: 10, marginTop: 1 }}>{currentTrack.meta}</p>
          {!hasAudio && currentWork && <p style={{ color: C.warning, fontSize: 9, marginTop: 1 }}>暂无真实音频</p>}
          {audioError && <p style={{ color: C.error, fontSize: 9, marginTop: 1 }}>{audioError}</p>}
        </div>
      </div>

      {/* Controls + waveform */}
      <div style={{ flex: 1, minWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Shuffle size={12} color={C.t3} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <SkipBack size={14} color={C.t2} />
          </button>
          <button
            onClick={togglePlay}
            aria-label={playing ? '暂停播放' : `播放${currentTrack.title}`}
            style={{
              width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99,102,241,0.5)',
            }}
          >
            {playing ? <Pause size={13} color="#fff" /> : <Play size={13} color="#fff" fill="#fff" />}
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <SkipForward size={14} color={C.t2} />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Repeat size={12} color={C.t3} />
          </button>
        </div>

        {/* Waveform timeline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', maxWidth: 420, height: 18 }}>
          {BARS.map((h, i) => {
            const played = i / BARS.length < progress;
            return (
              <div key={i} style={{
                flex: 1, maxWidth: 4, height: `${h * 100}%`, borderRadius: 999,
                background: played ? C.accent : 'rgba(255,255,255,0.1)',
                transition: 'background 0.1s',
              }} />
            );
          })}
        </div>
      </div>

      {/* Volume + time */}
      <div style={{ width: 260, minWidth: 260, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
        <span data-testid="bottom-player-time" style={{ color: C.t3, fontSize: 10, fontFamily: "'Inter', monospace", whiteSpace: 'nowrap', minWidth: 64, textAlign: 'right' }}>1:24 / {currentTrack.duration}</span>
        <Volume2 size={13} color={C.t2} />
        <div style={{ width: 76, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.1)', cursor: 'pointer' }}>
          <div style={{ width: '70%', height: '100%', borderRadius: 999, background: C.accent }} />
        </div>
        <button
          type="button"
          aria-label="播放列表"
          aria-expanded={queueOpen}
          onClick={() => setQueueOpen((open) => !open)}
          style={{
            width: 30, height: 30, borderRadius: 8, border: `1px solid ${queueOpen ? 'rgba(99,102,241,0.35)' : 'transparent'}`,
            background: queueOpen ? 'rgba(99,102,241,0.14)' : 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ListMusic size={14} color={queueOpen ? C.accentLight : C.t3} />
        </button>
      </div>

      {queueOpen && (
        <div
          role="dialog"
          aria-label="播放队列"
          style={{
            position: 'absolute',
            right: 20,
            bottom: 68,
            width: 300,
            borderRadius: 14,
            background: 'rgba(18,20,34,0.96)',
            border: `1px solid ${C.bdr1}`,
            boxShadow: '0 18px 60px rgba(0,0,0,0.35)',
            padding: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ color: C.t0, fontSize: 12, fontWeight: 600 }}>播放队列</p>
            <span style={{ color: C.t3, fontSize: 10 }}>{visibleQueue.length} 首</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {visibleQueue.map((item, index) => (
              <button
                key={item.id ?? item.title}
                type="button"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px',
                  borderRadius: 9, border: 'none', background: index === 0 ? 'rgba(99,102,241,0.12)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ width: 22, height: 22, borderRadius: 6, background: index === 0 ? C.accent : 'rgba(255,255,255,0.06)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>
                  {index + 1}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ color: C.t0, display: 'block', fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                  <span style={{ color: C.t3, display: 'block', fontSize: 10, marginTop: 1 }}>{item.tags?.[0] || '音乐'} · {item.duration || '3:47'}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </footer>
  );
}
