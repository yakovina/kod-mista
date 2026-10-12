"use client";

import { useEffect, useRef } from "react";
import type { QuizApi } from "../../useQuiz";
import { intro } from "../../../data/quiz";
import { asset } from "../../bp";
import ShareButtons from "../../ShareButtons";
import { SITE_URL, TEST_SHARE_TEXT, TEST_SHARE_TITLE, resultShareUrl } from "../../share";
import Progress, { type StepState } from "./Progress";
import { ArrowIcon, CheckIcon, RetryIcon, SendIcon } from "./icons";

const COVER_ALT = "Ілюстрація: місто з аркою, що тріснула, космонавт і супутник";

function stepStates(history: boolean[], idx: number, total: number, answered: boolean): StepState[] {
  return Array.from({ length: total }, (_, i) => {
    if (i < history.length && (i < idx || answered)) return history[i] ? "ok" : "miss";
    if (i === idx) return "now";
    return "next";
  });
}

export function Topbar() {
  return (
    <header className="topbar">
      <a href="https://hmarochos.kiev.ua/" target="_blank" rel="noopener noreferrer" aria-label="Хмарочос — відкрити сайт">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/hmarochos_logo_new.svg")} alt="Хмарочос" />
      </a>
      <span>Код міста</span>
    </header>
  );
}

export function Cover() {
  return (
    <figure className="cover">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset("/art/cover.jpg")} alt={COVER_ALT} />
    </figure>
  );
}

/** Клавіші: 1–4 або а/б/в/г — відповідь, Enter — далі. */
function useKeys(quiz: QuizApi) {
  const ref = useRef(quiz);
  useEffect(() => {
    ref.current = quiz;
  });
  useEffect(() => {
    const letters = ["а", "б", "в", "г"];
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const z = ref.current;
      if (z.screen === "question") {
        const n = ["1", "2", "3", "4"].indexOf(e.key);
        const o = z.q.options[n >= 0 ? n : letters.indexOf(e.key.toLowerCase())];
        if (o) {
          e.preventDefault();
          z.answer(o.key);
        }
      } else if (z.screen === "reveal" && e.key === "Enter" && t?.tagName !== "BUTTON" && t?.tagName !== "A") {
        e.preventDefault();
        z.next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

export default function RouteSkin({ quiz }: { quiz: QuizApi }) {
  const { screen, q, idx, total, picked, history, score, level } = quiz;
  useKeys(quiz);

  if (screen === "intro") {
    return (
      <main className="route screen intro">
        <Topbar />
        <div className="layout">
          <div className="visual">
            <Cover />
          </div>
          <div className="content">
            <h1 className="title">{intro.title}</h1>
            <p className="lead">{intro.lead}</p>
            <p className="meta">{intro.meta}</p>
            <button className="btn primary" onClick={quiz.start}>
              <span>Почати тест</span>
              <ArrowIcon />
            </button>
            <ShareButtons url={`${SITE_URL}/`} text={TEST_SHARE_TEXT} title={TEST_SHARE_TITLE} />
          </div>
        </div>
      </main>
    );
  }

  if (screen === "question") {
    return (
      <main className="route screen question">
        <Topbar />
        <div className="narrow">
          <Progress states={stepStates(history, idx, total, false)} label={`Питання ${idx + 1} з ${total}`} />
          <p className="topic">{q.topic}</p>
          {q.context && <p className="context">{q.context}</p>}
          <h2 className="prompt">{q.prompt}</h2>
          <div className="opts" role="group" aria-label="Варіанти відповіді">
            {q.options.map((o, i) => (
              <button key={o.key} className="opt" onClick={() => quiz.answer(o.key)} aria-keyshortcuts={String(i + 1)}>
                <span className="k">{o.key}</span>
                <span className="t">{o.text}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (screen === "reveal") {
    const ok = picked === q.correct;
    return (
      <main className="route screen reveal">
        <Topbar />
        <div className="narrow">
          <Progress states={stepStates(history, idx, total, true)} label={`Питання ${idx + 1} з ${total}`} />
          <div className={ok ? "verdict ok" : "verdict miss"} role="status">
            {ok ? <CheckIcon /> : <span className="verdictMark" aria-hidden>!</span>}
            <span>{ok ? "Правильно" : `Ні, правильна відповідь — ${q.correct}`}</span>
          </div>
          <h2 className="prompt small">{q.prompt}</h2>
          <ul className="opts done">
            {q.options.map((o) => {
              const state = o.key === q.correct ? "right" : o.key === picked ? "wrong" : "rest";
              return (
                <li key={o.key} className={`opt ${state}`}>
                  <span className="k">{o.key}</span>
                  <span className="t">{o.text}</span>
                  {o.key === picked && <span className="tag">ваша відповідь</span>}
                </li>
              );
            })}
          </ul>
          <section className="explain" aria-label="Пояснення">
            <p>{q.explanation}</p>
          </section>
          <div className="sources">
            <span className="sTitle">{q.sources.length > 1 ? "Джерела" : "Джерело"}</span>
            {q.sources.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            ))}
          </div>
          <button className="btn accent" onClick={quiz.next} aria-keyshortcuts="Enter">
            <span>{quiz.isLast ? "Мій результат" : "Наступне питання"}</span>
            <ArrowIcon />
          </button>
        </div>
      </main>
    );
  }

  // result
  const shareUrl = resultShareUrl(level.slug);
  const shareResult = async () => {
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
      alert("Посилання на результат скопійовано");
    } catch {
      /* ignore */
    }
  };
  return (
    <main className="route screen result">
      <Topbar />
      <div className="layout">
        <div className="visual">
          <Cover />
        </div>
        <div className="content">
          <p className="score">
            <b>{score}</b> з {total} правильних відповідей
          </p>
          <h1 className="title mid">{level.title}</h1>
          <p className="lead">{level.description}</p>
          <div className="btnRow">
            <button className="btn accent" onClick={shareResult}>
              <span>Поділитися результатом</span>
              <SendIcon />
            </button>
            <button className="btn square" onClick={quiz.restart} aria-label="Пройти ще раз" title="Пройти ще раз">
              <RetryIcon />
            </button>
          </div>
          <ShareButtons url={shareUrl} text={level.shareText} title={level.title} label="Або надішліть у соцмережу" />
        </div>
      </div>
    </main>
  );
}
