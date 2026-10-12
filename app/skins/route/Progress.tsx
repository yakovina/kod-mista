// Прогрес у вигляді маршруту: вісім пронумерованих зупинок на одній лінії.

export type StopState = "ok" | "miss" | "now" | "next";

export default function Progress({ states, label }: { states: StopState[]; label: string }) {
  const reached = Math.max(0, states.findLastIndex((s) => s !== "next"));
  const fill = states.length > 1 ? reached / (states.length - 1) : 0;
  return (
    <ol className="progress" aria-label={label} style={{ "--fill": fill } as React.CSSProperties}>
      {states.map((s, i) => (
        <li key={i} className={`stop ${s}`} aria-current={s === "now" ? "step" : undefined}>
          <span>{i + 1}</span>
        </li>
      ))}
    </ol>
  );
}
