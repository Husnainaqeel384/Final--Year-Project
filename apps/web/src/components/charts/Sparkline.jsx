/**
 * A tiny trend line for stat cards. The history is muted and only the latest
 * point is highlighted, so the card's main number stays the focus. Decorative:
 * the card's text already states the value.
 */
export function Sparkline({ values, width = 112, height = 32 }) {
  if (values.length < 2) return null;

  const pad = 3;
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const points = values.map((value, index) => [
    pad + (index / (values.length - 1)) * (width - pad * 2),
    pad + (1 - (value - min) / range) * (height - pad * 2),
  ]);
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="shrink-0">
      <polyline
        points={points.map((point) => point.join(',')).join(' ')}
        fill="none"
        stroke="var(--chart-axis)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r="3" fill="var(--chart-1)" stroke="var(--surface)" strokeWidth="2" />
    </svg>
  );
}
