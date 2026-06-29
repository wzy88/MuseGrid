import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, ListMusic } from 'lucide-react';
import { useState } from 'react';
import { C } from '../../design/tokens';

const QUEUE = [
  { title: '山海之旅', meta: '古风流行 · 3:47' },
  { title: '夏末路口', meta: '古风流行 · 3:47' },
  { title: '城市夜语', meta: 'R&B · 制作中' },
];

const BARS = Array.from({ length: 56 }, (_, i) => {
  const v = 0.15 + Math.abs(Math.sin(i * 0.72) * 0.45 + Math.sin(i * 1.6) * 0.25 + Math.sin(i * 3.1) * 0.1);
  return Math.min(1, Math.max(0.08, v));
});

export function BottomPlayer() {
  const [playing, setPlaying] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const progress = 0.35;

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
      {/* Track info */}
      <div style={{ width: 200, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #6366F1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: playing ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
          transition: 'box-shadow 0.3s',
        }}>
          <span style={{ fontSize: 16 }}>🎵</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ color: C.t0, fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            梦中之旅
          </p>
          <p style={{ color: C.t3, fontSize: 10, marginTop: 1 }}>古风流行 · Demo v2</p>
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
            onClick={() => setPlaying(!playing)}
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
        <span data-testid="bottom-player-time" style={{ color: C.t3, fontSize: 10, fontFamily: "'Inter', monospace", whiteSpace: 'nowrap', minWidth: 64, textAlign: 'right' }}>1:24 / 3:47</span>
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
            <span style={{ color: C.t3, fontSize: 10 }}>{QUEUE.length} 首</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {QUEUE.map((item, index) => (
              <button
                key={item.title}
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
                  <span style={{ color: C.t3, display: 'block', fontSize: 10, marginTop: 1 }}>{item.meta}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </footer>
  );
}
