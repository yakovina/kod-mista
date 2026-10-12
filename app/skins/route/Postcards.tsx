import { useId } from "react";
import type { Level, Question } from "../../../data/quiz";
import { asset } from "../../bp";

const TONES = ["mustard", "teal", "terracotta"] as const;
const toneOf = (id: number) => TONES[(id - 1) % TONES.length];

/** Поштова марка з перфорацією. */
export function Stamp({ code, sub = "ПОШТА" }: { code: string; sub?: string }) {
  return (
    <span className="stamp" aria-hidden>
      <span className="stampIn">
        <b>{code}</b>
        <small>{sub}</small>
      </span>
    </span>
  );
}

/** Штемпель: подвійне коло з написом по колу і хвилясті лінії гасіння. */
export function Postmark({ ring, center, className = "" }: { ring: string; center: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={`postmark ${className}`} viewBox="0 0 210 110" aria-hidden>
      {[38, 55, 72].map((y) => (
        <path key={y} d={`M2 ${y} q12 -9 24 0 t24 0 t24 0 t24 0 t12 0`} className="pmWave" />
      ))}
      <circle cx="152" cy="55" r="50" className="pmRing" />
      <circle cx="152" cy="55" r="33" className="pmRing thin" />
      <path id={id} d="M152 55 m-41.5 0 a41.5 41.5 0 1 1 83 0 a41.5 41.5 0 1 1 -83 0" fill="none" />
      <text className="pmRingText">
        <textPath href={`#${id}`} startOffset="0">
          {ring}
        </textPath>
      </text>
      <text x="152" y="61" textAnchor="middle" className="pmCenter">
        {center}
      </text>
    </svg>
  );
}

/** Мотив з обкладинки: смугаста арка з тріщиною. */
function ArchMotif() {
  const band = (r1: number, r2: number) =>
    `M${200 - r1} 200 A${r1} ${r1} 0 0 1 200 ${200 - r1} L200 ${200 - r2} A${r2} ${r2} 0 0 0 ${200 - r2} 200 Z`;
  return (
    <svg className="arch" viewBox="0 0 200 200" aria-hidden>
      <path d={band(196, 176)} className="a1" />
      <path d={band(176, 158)} className="a2" />
      <path d={band(158, 142)} className="a3" />
      <path d={band(142, 128)} className="a4" />
      <path d="M58 70 L66 82 L60 86 L70 98 L64 101 L74 112" className="crack" />
    </svg>
  );
}

/** Лицьовий бік листівки зупинки. */
export function PostcardFront({ q }: { q: Question }) {
  return (
    <figure className={`postcard front tone-${toneOf(q.id)}`}>
      <div className="pcFace">
        {q.place.art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(q.place.art)} alt={q.place.picture} />
        ) : (
          <div className="pcType">
            <ArchMotif />
            <span className="pcGreet">Привіт із</span>
            <span className="pcCity">{q.place.from}</span>
            <span className="pcNo">Зупинка {q.id}</span>
          </div>
        )}
        <Stamp code={q.place.code} />
      </div>
      <figcaption className="pcCaption">
        <span>{q.place.picture}</span>
        <span className="year">{q.place.year}</span>
      </figcaption>
    </figure>
  );
}

/** Зворот листівки: пояснення, марка, адресні рядки, штемпель. */
export function PostcardBack({ q }: { q: Question }) {
  return (
    <div className="postcard back">
      <div className="pcBackHead">
        <span className="pcLabel">Зворот листівки · зупинка {q.id}</span>
        <Stamp code={q.place.code} />
      </div>
      <p className="pcText">{q.explanation}</p>
      <div className="pcFoot" aria-hidden>
        <Postmark ring={`${q.place.city.toUpperCase()} · ${q.place.year} · КОД МІСТА · `} center={`№${q.id}`} />
        <div className="pcLines">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

/** Фінальна листівка — і на екрані результату, і на шер-сторінці. */
export function ResultPostcard({ level, score, total }: { level: Level; score?: number; total: number }) {
  const big = score !== undefined ? `${score}/${total}` : level.range.split(" ")[0];
  return (
    <figure className="postcard result">
      <div className="pcFace square">
        {level.character ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset(level.character)} alt={`Ілюстрація: ${level.title}`} />
        ) : (
          <div className="pcType result">
            <ArchMotif />
            <span className="pcGreet">Листівка з маршруту</span>
            <span className="pcScore">{big}</span>
            <span className="pcScoreSub">{score !== undefined ? "зупинок зараховано" : level.range.split(" ")[1]}</span>
          </div>
        )}
        <Stamp code="UA" sub="КОД МІСТА" />
      </div>
      <figcaption className="pcTo">
        <span className="pcToLabel">Кому</span>
        <b>{level.addressee}</b>
        <span className="pcToLine">Україна · вісім зупинок</span>
      </figcaption>
    </figure>
  );
}
