interface WaveformProps {
  bars?: number;
  progress?: number;
  height?: number;
  activeColor?: string;
  inactiveColor?: string;
  seed?: number;
}

function getBarHeights(count: number, seed: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const x = (i + seed) * 1.3;
    const v = 0.3 + Math.abs(Math.sin(x * 0.7) * 0.4 + Math.sin(x * 1.4) * 0.2 + Math.sin(x * 2.8) * 0.1);
    return Math.min(1, Math.max(0.08, v));
  });
}

export function Waveform({
  bars = 48,
  progress = 0,
  height = 36,
  activeColor = '#7C5DFA',
  inactiveColor = '#252638',
  seed = 0,
}: WaveformProps) {
  const heights = getBarHeights(bars, seed);
  return (
    <div className="flex items-center gap-[2px]" style={{ height }}>
      {heights.map((h, i) => {
        const isActive = i / bars < progress;
        return (
          <div
            key={i}
            className="rounded-full flex-1"
            style={{
              height: `${h * 100}%`,
              background: isActive ? activeColor : inactiveColor,
              maxWidth: 4,
              minWidth: 2,
            }}
          />
        );
      })}
    </div>
  );
}
