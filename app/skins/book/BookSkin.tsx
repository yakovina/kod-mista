"use client";

// Скін «Книга»: тест як науково-популярна книжка 80-х. Титульний аркуш,
// сторінка збірника задач із колонтитулом і колонцифрою, «Відповідь: в)»,
// виноски-джерела, вихідні дані на результаті. Друк у дві фарби.

import { useEffect, useRef } from "react";
import type { QuizApi } from "../../useQuiz";
import { ORDINALS, intro, questions } from "../../../data/quiz";
import { asset } from "../../bp";
import { SITE_URL, TEST_SHARE_TEXT, resultShareUrl } from "../../share";
import ShareLinks from "./ShareLinks";
import { ArrowIcon } from "./icons";

const COVER_ALT = "Ілюстрація: місто з аркою, що тріснула, космонавт і супутник";
const letter = (k: string) => `${k.toLowerCase()})`;

export function Logo() {
  return (
    <a className="logo" href="https://hmarochos.kiev.ua/" target="_blank" rel="noopener noreferrer" aria-label="Хмарочос — відкрити сайт">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset("/hmarochos_logo_new.svg")} alt="Хмарочос" />
    </a>
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

/** Астеризм — єдиний орнамент: три зірочки, як на обкладинці. */
const star = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`;
  }).join(" ");

export const Asterism = () => (
  <svg className="asterism" viewBox="0 0 40 30" aria-hidden>
    <polygon points={star(20, 8, 7)} />
    <polygon points={star(10, 22, 7)} />
    <polygon points={star(30, 22, 7)} />
  </svg>
);

/** «Олівцеве» коло навколо правильної букви. */
const PencilRing = () => (
  <svg className="pencil" viewBox="0 0 64 44" aria-hidden>
    <path d="M10 25 C 7 12, 30 4, 47 8 C 60 12, 59 31, 40 36 C 23 40, 5 34, 8 20 C 10 13, 19 8, 30 7" />
  </svg>
);

/** «Олівцеве» перекреслення хибної букви — червоним олівцем перевіряльника. */
const PencilStrike = () => (
  <svg className="pencil strike" viewBox="0 0 64 44" aria-hidden>
    <path d="M12 34 C 22 26, 36 17, 54 9" />
    <path d="M14 11 C 26 18, 40 27, 52 35" />
  </svg>
);

/** Плавна прокрутка власним кроком: не залежить від scroll-behavior браузера. */
function glide(to: number, ms: number) {
  const from = window.scrollY;
  const dist = to - from;
  if (Math.abs(dist) < 2) return;
  const t0 = performance.now();
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / ms);
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    window.scrollTo(0, from + dist * e);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
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

function Sheet({ quiz }: { quiz: QuizApi }) {
  const { screen, q, idx, total, picked } = quiz;
  const answered = screen === "reveal";
  const ok = picked === q.correct;
  const promptRef = useRef<HTMLHeadingElement>(null);
  const answerRef = useRef<HTMLElement>(null);

  // після відповіді: спершу олівець позначає правильну й хибну, потім
  // сторінка плавно гортається до пояснення
  useEffect(() => {
    if (screen === "question") {
      promptRef.current?.focus({ preventScroll: true });
      return;
    }
    if (screen !== "reveal") return;
    const el = answerRef.current;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(
      () => {
        if (!el) return;
        el.focus({ preventScroll: true });
        const top = el.getBoundingClientRect().top + window.scrollY - 24;
        if (calm) window.scrollTo(0, top);
        else glide(top, 700);
      },
      calm ? 400 : 1300,
    );
    return () => window.clearTimeout(t);
  }, [screen, idx]);

  return (
    <main className="book sheet" key={q.id}>
      <header className="runhead">
        <Logo />
        <span className="rhTitle">Код міста</span>
        <span className="rhTopic">{q.topic}</span>
      </header>
      <div className="readline" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={idx + (answered ? 1 : 0)} aria-label="Прогрес тесту">
        <span style={{ width: `${((idx + (answered ? 1 : 0)) / total) * 100}%` }} />
      </div>

      <article className="page">
        {q.context && <p className="context">{q.context}</p>}
        <h2 className="prompt" ref={promptRef} tabIndex={-1}>
          {q.prompt}
        </h2>

        <ol className={answered ? "opts done" : "opts"}>
          {q.options.map((o, i) => {
            if (!answered) {
              return (
                <li key={o.key}>
                  <button className="opt" onClick={() => quiz.answer(o.key)} aria-keyshortcuts={String(i + 1)}>
                    <span className="k">{letter(o.key)}</span>
                    <span className="t">{o.text}</span>
                  </button>
                </li>
              );
            }
            const state = o.key === q.correct ? "right" : o.key === picked ? "wrong" : "rest";
            return (
              <li key={o.key} className={`opt ${state}`}>
                <span className="k">
                  {letter(o.key)}
                  {state === "right" && <PencilRing />}
                  {state === "wrong" && <PencilStrike />}
                </span>
                <span className="t">
                  {o.text}
                  {state === "right" && <em className="mark">{ok ? "ваша відповідь, правильна" : "правильна відповідь"}</em>}
                  {state === "wrong" && <em className="mark">ваша відповідь</em>}
                </span>
              </li>
            );
          })}
        </ol>

        {answered && (
          <section className="answer" ref={answerRef} tabIndex={-1} aria-live="polite">
            <Asterism />
            <p className={ok ? "verdict ok" : "verdict miss"}>
              {ok ? "Саме так." : "Майже."} Відповідь: <b>{letter(q.correct)}</b>
            </p>
            <p className="explain">
              {q.explanation}
              <sup>{q.sources.map((_, i) => i + 1).join(", ")}</sup>
            </p>
            <div className="nextRow">
              <button className="btn primary" onClick={quiz.next} aria-keyshortcuts="Enter">
                <span>{quiz.isLast ? "Мій результат" : "Наступне питання"}</span>
                <ArrowIcon />
              </button>
            </div>
            <ol className="footnotes">
              {q.sources.map((s, i) => (
                <li key={s.url}>
                  <sup>{i + 1}</sup>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>

      <footer className="folio">Питання {ORDINALS[idx] ?? idx + 1}</footer>
    </main>
  );
}

export default function BookSkin({ quiz }: { quiz: QuizApi }) {
  const { screen, total, history, score, level } = quiz;
  useKeys(quiz);

  if (screen === "intro") {
    return (
      <main className="book closed intro">
        {/* закрита книжка: тканинна палітурка з вклеєною ілюстрацією */}
        <div className="bookCover">
          <span className="coverSpine" aria-hidden />
          <div className="coverFace">
            <span className="coverPub">Хмарочос</span>
            <h1 className="coverTitle">{intro.title}</h1>
            <figure className="coverPlate">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/art/cover.jpg")} alt={COVER_ALT} />
            </figure>
            <span className="coverSub">Вісім питань про будинки, вулиці й пам’ятники</span>
          </div>
        </div>

        {/* вкладка-анотація */}
        <aside className="annotation">
          <Logo />
          <h2>Анотація</h2>
          <p className="lead">{intro.lead}</p>
          <p className="meta">{intro.meta}</p>
          <button className="btn primary" onClick={quiz.start}>
            <span>Почати тест</span>
            <ArrowIcon />
          </button>
          <ShareLinks url={`${SITE_URL}/`} text={TEST_SHARE_TEXT} label="Поділитися тестом" />
        </aside>
      </main>
    );
  }

  if (screen === "question" || screen === "reveal") {
    return <Sheet quiz={quiz} />;
  }

  // result
  const shareUrl = resultShareUrl(level.slug);
  const misses = questions.filter((_, i) => history[i] === false);
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: level.title, text: level.shareText, url: shareUrl });
      } catch {
        /* скасовано */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${level.shareText} ${shareUrl}`);
      alert("Посилання на результат скопійовано");
    } catch {
      /* ignore */
    }
  };
  return (
    <main className="book spread result">
      <div className="leaf verso">
        <Cover />
      </div>
      <div className="leaf recto">
        <Logo />
        <p className="score">
          Правильних відповідей: {score} з {total}
        </p>
        <h1 className="title mid">{level.title}</h1>
        <p className="lead">{level.description}</p>
        <Asterism />
        <div className="btnCol">
          <button className="btn primary" onClick={share}>
            <span>Поділитися результатом</span>
            <ArrowIcon />
          </button>
          <button className="btn ghost" onClick={quiz.restart}>
            <span>Пройти ще раз</span>
          </button>
        </div>
        <ShareLinks url={shareUrl} text={level.shareText} label="Або надіслати" />

        {misses.length > 0 && (
          <section className="reread">
            <h2>Варто перечитати</h2>
            <ol>
              {misses.map((m) => {
                const right = m.options.find((o) => o.key === m.correct);
                return (
                  <li key={m.id}>
                    <p className="rq">{m.prompt}</p>
                    <p className="ra">
                      Відповідь: <b>{letter(m.correct)}</b> {right?.text}
                    </p>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        <p className="colophon">{intro.colophon}</p>
      </div>
    </main>
  );
}
