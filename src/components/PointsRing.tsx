"use client";

/** Anel de progresso SVG usado no widget "Brazil–Oman Chamber Rewards" do painel. */
export function PointsRing({
  points,
  progressPct,
  pointsLabel,
  size = 148,
}: {
  points: number;
  progressPct: number;
  pointsLabel: string;
  size?: number;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, progressPct)) / 100) * c;

  return (
    <div className="points-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border-strong)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--gold-bright)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="points-ring-center">
        <strong>{points.toLocaleString()}</strong>
        <span>{pointsLabel}</span>
      </div>
    </div>
  );
}
