// Смуга прогресу у вигляді маршруту з 8 зупинок.

export type StopState = "ok" | "miss" | "now" | "next";

const W = 354;
const H = 70;
const YS = [48, 20, 40, 58, 34, 16, 40, 22];

function points(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    x: 14 + (i * (W - 28)) / (n - 1),
    y: YS[i % YS.length],
  }));
}

/** Плавна крива через точки (Catmull-Rom → кубічні Безьє). */
function curve(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function RouteLine({ states, label }: { states: StopState[]; label: string }) {
  const pts = points(states.length);
  // суцільна лінія — до останньої пройденої або поточної зупинки
  const reached = Math.max(0, states.findLastIndex((s) => s !== "next"));
  const solid = curve(pts.slice(0, reached + 1));
  const rest = curve(pts.slice(reached));
  return (
    <svg className="routeLine" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {rest && <path d={rest} className="rl-dash" />}
      {solid && <path d={solid} className="rl-solid" />}
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={states[i] === "now" ? 11 : 7}
          className={`rl-stop ${states[i]}`}
        />
      ))}
    </svg>
  );
}
