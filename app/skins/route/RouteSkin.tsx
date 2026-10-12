"use client";

import type { QuizApi } from "../../useQuiz";
import { intro, questions } from "../../../data/quiz";
import { asset } from "../../bp";
import ShareButtons from "../../ShareButtons";
import { SITE_URL, TEST_SHARE_TEXT, TEST_SHARE_TITLE, resultShareUrl } from "../../share";
import Progress, { type StopState } from "./Progress";
import { PostcardBack, PostcardFront, ResultPostcard, Stamp } from "./Postcards";
import { ArrowIcon, CheckIcon, RetryIcon, SendIcon } from "./icons";

function stopStates(history: boolean[], idx: number, total: number, onReveal: boolean): StopState[] {
  return Array.from({ length: total }, (_, i) => {
    if (i < history.length && (i < idx || onReveal)) return history[i] ? "ok" : "miss";
    if (i === idx) return "now";
    return "next";
  });
}

export function Topbar({ right }: { right: string }) {
  return (
    <header className="topbar">
      <a href="https://hmarochos.kiev.ua/" target="_blank" rel="noopener noreferrer" aria-label="Хмарочос — відкрити сайт">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/hmarochos_logo_new.svg")} alt="Хмарочос" />
      </a>
      <span>{right}</span>
    </header>
  );
}

const CITIES = Array.from(new Set(questions.map((q) => q.place.city).filter((c) => c !== "Ваше місто")));

export default function RouteSkin({ quiz }: { quiz: QuizApi }) {
  const { screen, q, idx, total, picked, history, score, level } = quiz;

  if (screen === "intro") {
    return (
      <main className="route screen intro">
        <Topbar right="Тест · 8 зупинок" />
        <div className="layout">
          <div className="visual">
            <figure className="coverCard">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/art/cover.jpg")} alt="Ілюстрація: місто з аркою, що тріснула, космонавт і супутник" />
              <Stamp code="8" sub="ЗУПИНОК" />
            </figure>
          </div>
          <div className="content">
            <p className="kicker">Тест Хмарочоса</p>
            <h1 className="title">{intro.title}</h1>
            <p className="lead">{intro.lead}</p>
            <ol className="cities" aria-label="Міста маршруту">
              <li>Ваше місто</li>
              {CITIES.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
            <button className="btn primary" onClick={quiz.start}>
              <span>В дорогу</span>
              <ArrowIcon />
            </button>
            <div className="meta">
              <span>{intro.minutes}</span>
              <span>{intro.sourcesNote}</span>
            </div>
            <ShareButtons url={`${SITE_URL}/`} text={TEST_SHARE_TEXT} title={TEST_SHARE_TITLE} />
          </div>
        </div>
      </main>
    );
  }

  if (screen === "question") {
    return (
      <main className="route screen question">
        <Topbar right={`Зупинка ${idx + 1} з ${total}`} />
        <Progress states={stopStates(history, idx, total, false)} label={`Зупинка ${idx + 1} з ${total}`} />
        <div className="layout">
          <div className="visual">
            <PostcardFront q={q} />
          </div>
          <div className="content">
            <p className="kicker">
              {q.topic} · {q.place.city}
            </p>
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
          </div>
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
        <Topbar right={`Зупинка ${idx + 1} з ${total}`} />
        <Progress states={stopStates(history, idx, total, true)} label={`Зупинку ${idx + 1} пройдено`} />
        <div className="layout split">
          <div className="content top">
            <div className={ok ? "verdict ok" : "verdict miss"} role="status">
              {ok ? <CheckIcon /> : <span className="verdictMark" aria-hidden>!</span>}
              <div>
                <div className="vTitle">{ok ? "Влучно — зупинку зараховано" : "Майже. Ось як було насправді"}</div>
                <div className="vSub">
                  {ok ? `Правильна відповідь — ${q.correct}` : `Ваша відповідь — ${picked}, правильна — ${q.correct}`}
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
          </div>
          <div className="visual">
            <PostcardBack q={q} />
          </div>
          <div className="content bottom">
            <div className="sources">
              <span className="sTitle">{q.sources.length > 1 ? "Джерела" : "Джерело"}</span>
              {q.sources.map((s) => (
                <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              ))}
            </div>
            <button className="btn accent" onClick={quiz.next}>
              <span>{quiz.isLast ? "До фінальної листівки" : "Наступна зупинка"}</span>
              <ArrowIcon />
            </button>
          </div>
        </div>
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
      <Topbar right="Маршрут завершено" />
      <Progress states={stopStates(history, total, total, true)} label={`Влучно: ${score} з ${total}`} />
      <div className="layout">
        <div className="visual">
          <ResultPostcard level={level} score={score} total={total} />
        </div>
        <div className="content">
          <p className="kicker">Ваш результат · {level.range}</p>
          <h1 className="title mid">{level.title}</h1>
          <p className="lead">{level.description}</p>
          <div className="btnRow">
            <button className="btn accent" onClick={sendCard}>
              <span>Надіслати листівку</span>
              <SendIcon />
            </button>
            <button className="btn square" onClick={quiz.restart} aria-label="Пройти ще раз" title="Пройти ще раз">
              <RetryIcon />
            </button>
          </div>
          <ShareButtons url={shareUrl} text={level.shareText} title={level.title} label="Поділитися результатом" />
        </div>
      </div>
    </main>
  );
}
