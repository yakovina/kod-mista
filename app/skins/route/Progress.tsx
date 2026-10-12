// Прогрес: вісім сегментів, пройдені зафарбовані за результатом.

export type StepState = "ok" | "miss" | "now" | "next";

export default function Progress({ states, label }: { states: StepState[]; label: string }) {
  return (
    <div className="progress">
      <div className="bar" role="img" aria-label={label}>
        {states.map((s, i) => (
          <span key={i} className={`seg ${s}`} />
        ))}
      </div>
      <span className="count">{label}</span>
    </div>
  );
}
