import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, ListMusic } from 'lucide-react';
import { useState } from 'react';
import { C } from '../../design/tokens';

const BARS = Array.from({ length: 56 }, (_, i) => {
  const v = 0.15 + Math.abs(Math.sin(i * 0.72) * 0.45 + Math.sin(i * 1.6) * 0.25 + Math.sin(i * 3.1) * 0.1);
  return Math.min(1, Math.max(0.08, v));
});

export function BottomPlayer() {
  const [playing, setPlaying] = useState(false);
  const progress = 0.35;

  return (
    <footer style={{
      height: 60, flexShrink: 0,
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px',
      background: 'rgba(6,7,15,0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
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
      <div style={{ width: 160, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
        <span style={{ color: C.t3, fontSize: 10, fontFamily: "'Inter', monospace" }}>1:24 / 3:47</span>
        <Volume2 size={13} color={C.t2} />
        <div style={{ width: 56, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.1)', cursor: 'pointer' }}>
          <div style={{ width: '70%', height: '100%', borderRadius: 999, background: C.accent }} />
        </div>
        <ListMusic size={13} color={C.t3} />
      </div>
    </footer>
  );
}
