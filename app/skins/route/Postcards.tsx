import type { Level, Question } from "../../../data/quiz";
import { postcardArt } from "../../../data/quiz";
import { asset } from "../../bp";

export function Stamp({ code, tone = "blue" }: { code: string; tone?: "blue" | "apricot" }) {
  return (
    <span className={`stamp ${tone}`} aria-hidden>
      {code}
    </span>
  );
}

/** Лицьовий бік листівки зупинки. */
export function PostcardFront({ q }: { q: Question }) {
  return (
    <figure className="postcard front">
      <div className="pcPic">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(postcardArt(q.id))} alt={q.place.picture} />
      </div>
      <Stamp code={q.place.code} />
      <figcaption className="pcCaption">
        <span className="hello">Привіт із {q.place.from}!</span>
        <span className="year">{q.place.year}</span>
      </figcaption>
    </figure>
  );
}

/** Зворот листівки: марка, пояснення, адресні рядки, штемпель. */
export function PostcardBack({ q }: { q: Question }) {
  return (
    <div className="postcard back">
      <div className="pcBackHead">
        <span className="pcLabel">Зворот листівки</span>
        <Stamp code={q.place.code} />
      </div>
      <p className="pcText">{q.explanation}</p>
      <div className="pcAddress" aria-hidden>
        <span className="line" />
        <span className="line" />
        <span className="postmark">
          <b>{q.place.city.toUpperCase()}</b>
          <i>{q.place.year}</i>
          <small>ЗУПИНКА {q.id}</small>
        </span>
      </div>
    </div>
  );
}

/** Фінальна листівка з персонажем — і на екрані результату, і на шер-сторінці. */
export function ResultPostcard({ level, score, total }: { level: Level; score?: number; total: number }) {
  return (
    <figure className="postcard result">
      <div className="pcPic tall">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(level.character)} alt={`Ілюстрація: ${level.title}`} />
      </div>
      <div className="pcResultGrid">
        <p className="pcText small">Маршрут від вашого міста через Полтаву й Харків до Києва та Південного.</p>
        <div className="pcTo">
          <span>Кому:</span>
          <b>{level.addressee}</b>
          <span className="pcCountry">Україна</span>
        </div>
      </div>
      <span className="postmark big" aria-hidden>
        <b>{score !== undefined ? `${score}/${total}` : level.range.split(" ")[0]}</b>
        <small>{score !== undefined ? "ЗУПИНОК" : level.range.split(" ")[1].toUpperCase()}</small>
      </span>
    </figure>
  );
}
