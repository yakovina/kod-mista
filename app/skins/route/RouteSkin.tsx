"use client";

import { useEffect, useRef } from "react";
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

function StopHead({ n, topic, city }: { n: number; topic: string; city: string }) {
  return (
    <div className="stopHead">
      <span className="stopNum" aria-hidden>
        {String(n).padStart(2, "0")}
      </span>
      <span className="stopMeta">
        <span className="kicker">{topic}</span>
        <span className="stopCity">{city}</span>
      </span>
    </div>
  );
}

/** Клавіші: 1–4 або а/б/в/г — відповідь, Enter — далі. */
function useKeys(quiz: QuizApi) {
  const ref = useRef(quiz);
  ref.current = quiz;
  useEffect(() => {
    const keys = ["а", "б", "в", "г"];
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const z = ref.current;
      if (z.screen === "question") {
        const i = ["1", "2", "3", "4"].indexOf(e.key) >= 0 ? Number(e.key) - 1 : keys.indexOf(e.key.toLowerCase());
        const o = z.q.options[i];
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

const CITIES = Array.from(new Set(questions.map((q) => q.place.city).filter((c) => c !== "Ваше місто")));

export default function RouteSkin({ quiz }: { quiz: QuizApi }) {
  const { screen, q, idx, total, picked, history, score, level } = quiz;
  useKeys(quiz);

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
            <StopHead n={idx + 1} topic={q.topic} city={q.place.city} />
            {q.context && <p className="context">{q.context}</p>}
            <h2 className="prompt">{q.prompt}</h2>
            <div className="opts" role="group" aria-label="Варіанти відповіді">
              {q.options.map((o, i) => (
                <button key={o.key} className="opt" onClick={() => quiz.answer(o.key)} aria-keyshortcuts={String(i + 1)}>
                  <span className="k">{o.key.toLowerCase()}</span>
                  <span className="t">{o.text}</span>
                </button>
              ))}
            </div>
            <p className="hint">Можна відповідати клавішами 1–4</p>
          </div>
        </div>
      </main>
    );
  }

  if (screen === "reveal") {
    const ok = picked === q.correct;
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
                <div className="vSub">{ok ? "Ви обрали правильну відповідь" : "Правильну відповідь позначено нижче"}</div>
              </div>
            </div>
            <p className="promptSmall">{q.prompt}</p>
            <ul className="opts done">
              {q.options.map((o) => {
                const state = o.key === q.correct ? "right" : o.key === picked ? "wrong" : "rest";
                return (
                  <li key={o.key} className={`opt ${state}`}>
                    <span className="k">{o.key.toLowerCase()}</span>
                    <span className="t">{o.text}</span>
                    {state === "right" && <span className="tag">{ok ? "ваша відповідь" : "правильна"}</span>}
                    {state === "wrong" && <span className="tag">ваша відповідь</span>}
                  </li>
                );
              })}
            </ul>
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
            <button className="btn accent" onClick={quiz.next} aria-keyshortcuts="Enter">
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
