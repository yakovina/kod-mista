// Мапа маршруту на обкладинці. Схематична: міста розставлені умовно,
// поки ілюстраторка не намалює справжню мапу (тоді — <img> з /art/map.svg).
const STOPS = [
  { x: 70, y: 98, name: "Київ", dx: -14, dy: -18 },
  { x: 190, y: 112, name: "Полтава", dx: -22, dy: -18 },
  { x: 272, y: 84, name: "Харків", dx: -24, dy: -18 },
  { x: 112, y: 222, name: "Ваше місто", dx: -72, dy: 30 },
  { x: 250, y: 252, name: "Південне", dx: -44, dy: 30 },
];

export default function CoverMap() {
  return (
    <svg className="coverMap" viewBox="0 0 334 300" role="img" aria-label="Мапа маршруту: Київ, Полтава, Харків, ваше місто, Південне">
      <rect width="334" height="300" className="cm-bg" />
      <path d="M10 210 C 60 200, 80 240, 120 230 S 200 170, 240 190 S 310 250, 326 230" className="cm-river" />
      <path
        d="M112 222 C 90 170, 50 140, 70 98 S 160 70, 190 112 S 250 120, 272 84 M190 112 C 200 170, 220 200, 250 252"
        className="cm-route"
      />
      {STOPS.map((s, i) => (
        <g key={s.name}>
          <circle cx={s.x} cy={s.y} r="9" className={i === 3 ? "cm-stop start" : "cm-stop"} />
          <text x={s.x + s.dx} y={s.y + s.dy} className="cm-label">
            {s.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
