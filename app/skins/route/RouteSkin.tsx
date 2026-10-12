"use client";

import type { QuizApi } from "../../useQuiz";
import { intro } from "../../../data/quiz";
import { asset } from "../../bp";
import ShareButtons from "../../ShareButtons";
import { SITE_URL, TEST_SHARE_TEXT, TEST_SHARE_TITLE, resultShareUrl } from "../../share";
import RouteLine, { type StopState } from "./RouteLine";
import { PostcardBack, PostcardFront, ResultPostcard } from "./Postcards";
import CoverMap from "./CoverMap";
import { ArrowIcon, CheckIcon, RetryIcon, SendIcon } from "./icons";

function stopStates(history: boolean[], idx: number, total: number, onReveal: boolean): StopState[] {
  return Array.from({ length: total }, (_, i) => {
    if (i < history.length && (i < idx || onReveal)) return history[i] ? "ok" : "miss";
    if (i === idx) return "now";
    return "next";
  });
}

function Masthead() {
  return (
    <div className="masthead">
      <a href="https://hmarochos.kiev.ua/" target="_blank" rel="noopener noreferrer" aria-label="Хмарочос — відкрити сайт">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/hmarochos_logo_new.svg")} alt="Хмарочос" />
      </a>
      <span>Тест · 8 зупинок</span>
    </div>
  );
}

export default function RouteSkin({ quiz }: { quiz: QuizApi }) {
  const { screen, q, idx, total, picked, history, score, level } = quiz;

  if (screen === "intro") {
    return (
      <main className="route screen intro">
        <Masthead />
        <div className="postcard mapCard">
          <CoverMap />
          <span className="stamp apricot big" aria-hidden>
            <b>8</b>
            <small>ЗУПИНОК</small>
          </span>
        </div>
        <h1 className="title">{intro.title}</h1>
        <p className="lead">{intro.lead}</p>
        <div className="grow" />
        <button className="btn blue" onClick={quiz.start}>
          <span>В дорогу</span>
          <ArrowIcon />
        </button>
        <div className="meta">
          <span>{intro.minutes}</span>
          <span>{intro.sourcesNote}</span>
        </div>
        <ShareButtons url={`${SITE_URL}/`} text={TEST_SHARE_TEXT} title={TEST_SHARE_TITLE} />
      </main>
    );
  }

  if (screen === "question") {
    return (
      <main className="route screen question">
        <RouteLine states={stopStates(history, idx, total, false)} label={`Зупинка ${idx + 1} з ${total}`} />
        <div className="stopLabel">
          <span>{q.topic}</span>
          <span>
            Зупинка {idx + 1} · {q.place.city}
          </span>
        </div>
        <PostcardFront q={q} />
        {q.context && <p className="context">{q.context}</p>}
        <h2 className="prompt">{q.prompt}</h2>
        <div className="opts">
          {q.options.map((o) => (
            <button key={o.key} className="opt" onClick={() => quiz.answer(o.key)}>
              <span className="k">{o.key}</span>
              <span className="t">{o.text}</span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  if (screen === "reveal") {
    const ok = picked === q.correct;
    const right = q.options.find((o) => o.key === q.correct);
    const mine = q.options.find((o) => o.key === picked);
    return (
      <main className="route screen reveal">
        <RouteLine states={stopStates(history, idx, total, true)} label={`Зупинку ${idx + 1} пройдено`} />
        <div className={ok ? "verdict ok" : "verdict miss"} role="status">
          {ok ? <CheckIcon /> : <span className="verdictMark" aria-hidden>!</span>}
          <div>
            <div className="vTitle">{ok ? "Влучно — зупинку зараховано" : "Майже. Ось як було насправді"}</div>
            <div className="vSub">
              {ok ? `Правильна відповідь — ${q.correct}` : `Ваша відповідь — ${picked}. Правильна — ${q.correct}`}
            </div>
          </div>
        </div>
        <div className="answerRecap">
          <span className="k">{q.correct}</span>
          <span>{right?.text}</span>
        </div>
        {!ok && mine && (
          <div className="answerRecap mine">
            <span className="k">{mine.key}</span>
            <span>{mine.text}</span>
          </div>
        )}
        <PostcardBack q={q} />
        <div className="sources">
          <span className="sTitle">{q.sources.length > 1 ? "Джерела" : "Джерело"}</span>
          {q.sources.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
        </div>
        <div className="grow" />
        <button className="btn apricot" onClick={quiz.next}>
          <span>{quiz.isLast ? "До фінальної листівки" : "Наступна зупинка"}</span>
          <ArrowIcon />
        </button>
      </main>
    );
  }

  // result
  const shareUrl = resultShareUrl(level.slug);
  const sendCard = async () => {
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({ title: level.title, text: level.shareText, url: shareUrl });
      } catch {
        /* скасовано */
      }
      return;
    }
    try {
      await nav?.clipboard?.writeText(`${level.shareText} ${shareUrl}`);
      alert("Посилання на листівку скопійовано");
    } catch {
      /* ignore */
    }
  };
  return (
    <main className="route screen result">
      <Masthead />
      <div className="kicker">Маршрут завершено · {total} зупинок</div>
      <ResultPostcard level={level} score={score} total={total} />
      <h1 className="title small">{level.title}</h1>
      <p className="lead">{level.description}</p>
      <div className="grow" />
      <div className="btnRow">
        <button className="btn apricot" onClick={sendCard}>
          <span>Надіслати листівку</span>
          <SendIcon />
        </button>
        <button className="btn square" onClick={quiz.restart} aria-label="Пройти ще раз">
          <RetryIcon />
        </button>
      </div>
      <ShareButtons url={shareUrl} text={level.shareText} title={level.title} label="Поділитися результатом" />
    </main>
  );
}
