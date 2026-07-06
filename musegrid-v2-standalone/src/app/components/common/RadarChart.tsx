interface RadarChartProps {
  values: number[]; // 0 to 1 for each dimension
  labels: string[];
  size?: number;
  color?: string;
}

export function RadarChart({ values, labels, size = 140, color = '#7C5DFA' }: RadarChartProps) {
  const n = values.length;
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const labelR = size * 0.49;

  const angle = (i: number) => (i * 2 * Math.PI / n) - Math.PI / 2;
  const pt = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPath = (level: number) => {
    const pts = Array.from({ length: n }, (_, i) => pt(i, r * level));
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ') + 'Z';
  };

  const valuePath = values.map((v, i) => {
    const p = pt(i, r * v);
    return `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }).join(' ') + 'Z';

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {/* Grid rings */}
      {gridLevels.map((level, gi) => (
        <path key={gi} d={gridPath(level)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      ))}
      {/* Axis lines */}
      {Array.from({ length: n }, (_, i) => {
        const p = pt(i, r);
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        );
      })}
      {/* Value fill */}
      <path d={valuePath} fill={`${color}28`} stroke={color} strokeWidth="1.5" />
      {/* Value dots */}
      {values.map((v, i) => {
        const p = pt(i, r * v);
        return <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />;
      })}
      {/* Labels */}
      {labels.map((label, i) => {
        const p = pt(i, labelR);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#7879A0"
            fontSize="10"
            fontFamily="'Noto Sans SC', sans-serif"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
