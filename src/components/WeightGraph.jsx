/**
 * WeightGraph — clean SVG sparkline showing weight history
 * No external deps — pure SVG
 */
export function WeightGraph({ data = [], goal, height = 120 }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ height, display:"flex", alignItems:"center", justifyContent:"center", color:"var(--muted2)", fontSize:13 }}>
        Add at least 2 weight entries to see your graph
      </div>
    );
  }

  const W = 320;
  const H = height;
  const PAD = { top:16, right:16, bottom:28, left:36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top  - PAD.bottom;

  const weights = data.map(d => d.weight_kg);
  const dates   = data.map(d => new Date(d.logged_at));
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;

  const xScale = (i) => PAD.left + (i / (data.length - 1)) * chartW;
  const yScale = (w) => PAD.top + chartH - ((w - minW) / (maxW - minW)) * chartH;

  const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.weight_kg) }));
  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");
  
  // Filled area path
  const areaPath = `M ${points[0].x} ${yScale(minW)} L ${points.map(p => `${p.x} ${p.y}`).join(" L ")} L ${points[points.length-1].x} ${yScale(minW)} Z`;

  // Y axis labels
  const yTicks = [minW+1, (minW+maxW)/2, maxW-1].map(v => Math.round(v));

  // X axis: first, middle, last date
  const xLabels = [0, Math.floor((data.length-1)/2), data.length-1].filter((v,i,a) => a.indexOf(v)===i);

  const fmt = (d) => d.toLocaleDateString("en-GB", { day:"numeric", month:"short" });

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id="wg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%"   stopColor="#2563EB" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={W-PAD.right} y1={yScale(tick)} y2={yScale(tick)} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3 3" />
          <text x={PAD.left-6} y={yScale(tick)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#94A3B8">{tick}</text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#wg)" />

      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#2563EB" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#fff" stroke="#2563EB" strokeWidth={2} />
      ))}

      {/* Last value label */}
      <text x={points[points.length-1].x} y={points[points.length-1].y - 10} textAnchor="middle" fontSize={11} fontWeight="700" fill="#2563EB">
        {weights[weights.length-1]} kg
      </text>

      {/* X axis labels */}
      {xLabels.map(i => (
        <text key={i} x={xScale(i)} y={H-4} textAnchor="middle" fontSize={10} fill="#94A3B8">{fmt(dates[i])}</text>
      ))}
    </svg>
  );
}
