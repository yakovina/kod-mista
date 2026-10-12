"use client";

// Скін «Мемфіс з ілюстрації»: дизайн 80-х, зібраний із мотивів обкладинки —
// смугаста арка, зірки, супутник, сітка вікон. Плоскі фігури з товстим
// чорнильним контуром і жорсткими тінями-зсувами; кольори лише з ілюстрації.

import { useEffect, useRef, useState } from "react";
import type { QuizApi } from "../../useQuiz";
import { intro, questions, type Level } from "../../../data/quiz";
import { asset } from "../../bp";
import { SITE_URL, TEST_SHARE_TEXT, resultShareUrl } from "../../share";
import { COVER_ALT, buzz, glide, useKeys } from "../common";

const Arrow = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

const STAR = "30,3 37,22 57,22 41,34 47,54 30,42 13,54 19,34 3,22 23,22";

/** Фігури з обкладинки, прив'язані до кутів екрана. */
function Decor({ variant }: { variant: "intro" | "sheet" | "result" }) {
  return (
    <div className={`decor ${variant}`} aria-hidden>
      <svg className="d d-sputnik" viewBox="0 0 160 120">
        <line x1="96" y1="58" x2="10" y2="12" />
        <line x1="96" y1="58" x2="22" y2="104" />
        <circle cx="120" cy="52" r="32" className="f-teal" />
        <circle cx="110" cy="40" r="8" className="f-light" />
      </svg>
      <svg className="d d-star1" viewBox="0 0 60 60">
        <polygon points={STAR} className="f-brick" />
      </svg>
      <svg className="d d-star2" viewBox="0 0 60 60">
        <polygon points={STAR} className="f-ink" />
      </svg>
      <svg className="d d-arch" viewBox="0 0 200 200">
        <path className="f-teal" d="M200 0 A 200 200 0 0 0 0 200 L 28 200 A 172 172 0 0 1 200 28 Z" />
        <path className="f-mid" d="M200 28 A 172 172 0 0 0 28 200 L 52 200 A 148 148 0 0 1 200 52 Z" />
        <path className="f-light" d="M200 52 A 148 148 0 0 0 52 200 L 74 200 A 126 126 0 0 1 200 74 Z" />
      </svg>
      <svg className="d d-windows" viewBox="0 0 150 200">
        <rect x="2" y="2" width="146" height="220" className="f-stone" />
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={18 + c * 44} y={20 + r * 44} width="26" height="30" className="f-teal" />),
        )}
      </svg>
    </div>
  );
}

function Logo() {
  return (
    <a className="logoChip" href="https://hmarochos.kiev.ua/" target="_blank" rel="noopener noreferrer" aria-label="Хмарочос — відкрити сайт">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset("/hmarochos_logo_new.svg")} alt="Хмарочос" />
    </a>
  );
}

function CoverCard() {
  return (
    <figure className="coverCard">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset("/art/cover.jpg")} alt={COVER_ALT} />
    </figure>
  );
}

/** «Поділитися»: на тач-пристроях — системне меню, інакше три варіанти. */
function Share({ url, text, label, primary = false }: { url: string; text: string; label: string; primary?: boolean }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const popup = (u: string) => window.open(u, "_blank", "noopener,noreferrer,width=620,height=560");
  const main = async () => {
    buzz(8);
    if (window.matchMedia("(pointer: coarse)").matches && navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch {
        /* скасовано */
      }
      return;
    }
    setOpen((o) => !o);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="share">
      <button type="button" className={primary ? "mbtn accent" : "mbtn plain"} onClick={main} aria-expanded={open}>
        <span>{label}</span>
      </button>
      {open && (
        <div className="shareRow">
          <button type="button" className="tag" onClick={() => popup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}>
            Facebook
          </button>
          <button type="button" className="tag" onClick={() => popup(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`)}>
            Telegram
          </button>
          <button type="button" className="tag" onClick={copy}>
            {copied ? "Скопійовано" : "Копіювати посилання"}
          </button>
        </div>
      )}
    </div>
  );
}

/** Бал, що рахується від нуля. */
function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || to === 0) {
      setN(to);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 700);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <b>{n}</b>;
}

/** Зірка з галочкою — значок правильної відповіді. */
const StarTick = () => (
  <svg className="starTick" viewBox="0 0 60 60" aria-hidden>
    <polygon points="30,3 37,22 57,22 41,34 47,54 30,42 13,54 19,34 3,22 23,22" />
    <path d="M20 30 l 7 7 l 13 -15" />
  </svg>
);

/** Перше речення пояснення — жирним як головна думка. */
function Explanation({ text }: { text: string }) {
  const m = text.match(/^(.+?[.!?])\s+([\s\S]+)$/);
  return <p className="explain">{m ? <><strong>{m[1]}</strong> {m[2]}</> : text}</p>;
}

function Steps({ history, idx, answered }: { history: boolean[]; idx: number; answered: boolean }) {
  return (
    <div className="steps" role="img" aria-label={`Питання ${idx + 1} з ${questions.length}`}>
      {questions.map((_, i) => {
        const s = i < history.length && (i < idx || answered) ? (history[i] ? "ok" : "miss") : i === idx ? "now" : "next";
        return <span key={i} className={`step ${s}`} />;
      })}
    </div>
  );
}

function Sheet({ quiz }: { quiz: QuizApi }) {
  const { screen, q, idx, total, picked, history, score } = quiz;
  const answered = screen === "reveal";
  const ok = picked === q.correct;
  const promptRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  // після відповіді: позначки на варіантах (~0.7 с), одразу потім — до картки
  useEffect(() => {
    if (screen === "question") {
      promptRef.current?.focus({ preventScroll: true });
      return;
    }
    if (screen !== "reveal") return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(
      () => {
        const el = cardRef.current;
        if (!el) return;
        el.focus({ preventScroll: true });
        const top = el.getBoundingClientRect().top + window.scrollY - 28;
        if (calm) window.scrollTo(0, top);
        else glide(top, 550);
      },
      60,
    );
    return () => window.clearTimeout(t);
  }, [screen, idx]);

  return (
    <main className="memphis sheet" key={q.id}>
      <Decor variant="sheet" />
      <div className="col">
        <header className="bar">
          <Logo />
          <span className="count">
            Питання {idx + 1} з {total}
          </span>
        </header>
        <Steps history={history} idx={idx} answered={answered} />

        <section className="qcard">
          <span className="topic">{q.topic}</span>
          {q.context && <p className="context">{q.context}</p>}
          <h2 className="prompt" ref={promptRef} tabIndex={-1}>
            {q.prompt}
          </h2>
        </section>

        <ol className={answered ? "opts done" : "opts"}>
          {q.options.map((o, i) => {
            const state = !answered ? "" : o.key === q.correct ? "isRight" : o.key === picked ? "isWrong" : "isRest";
            const inner = (
              <>
                <span className="k">
                  {o.key}
                </span>
                <span className="t">{o.text}</span>
                {state === "isRight" && <StarTick />}
              </>
            );
            return (
              <li key={o.key}>
                {answered ? (
                  <div className={`opt ${state}`}>{inner}</div>
                ) : (
                  <button
                    className="opt"
                    onClick={() => {
                      buzz(o.key === q.correct ? 18 : [28, 45, 28]);
                      quiz.answer(o.key);
                    }}
                    aria-keyshortcuts={String(i + 1)}
                  >
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ol>

        {answered && (
          <section className={`acard ${ok ? "ok" : "miss"}`} ref={cardRef} tabIndex={-1} aria-live="polite">
            <span className="sticker">{ok ? "Так!" : "Ой, ні!"}</span>
            <div className="acardBody">
              <p className="akey">{ok ? `Ваша відповідь — ${q.correct}` : `Правильна відповідь — ${q.correct}`}</p>
              <Explanation text={q.explanation} />
              <div className="srcs">
                {q.sources.map((s) => (
                  <a key={s.url} className="tag" href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="acardFoot">
              <span>
                Поки що: {score} з {idx + 1}
              </span>
              <span className="dots" aria-hidden>
                {history.map((h, i) => (
                  <i key={i} className={h ? "ok" : "miss"} />
                ))}
              </span>
            </div>
          </section>
        )}

        {answered && (
          <button
            className="mbtn accent next"
            onClick={() => {
              buzz(8);
              quiz.next();
            }}
            aria-keyshortcuts="Enter"
          >
            <span>{quiz.isLast ? "Мій результат" : "Наступне питання"}</span>
            <Arrow />
          </button>
        )}
      </div>
    </main>
  );
}

function ResultBody({ level, score, onRestart, showMisses, history }: { level: Level; score?: number; onRestart?: () => void; showMisses?: boolean; history?: boolean[] }) {
  const shareUrl = resultShareUrl(level.slug);
  const misses = showMisses && history ? questions.filter((_, i) => history[i] === false) : [];
  return (
    <main className="memphis split result">
      <Decor variant="result" />
      <div className="splitInner">
        <div className="left">
          <CoverCard />
        </div>
        <div className="right">
          <Logo />
          <p className="score">{score !== undefined ? <><CountUp to={score} /> з {questions.length} правильних</> : `Результат · ${level.range}`}</p>
          <h1 className="titleBlock mid">{level.title}</h1>
          <p className="lead">{level.description}</p>
          <div className="actions">
            <Share url={shareUrl} text={level.shareText} label="Поділитися результатом" primary />
            {onRestart ? (
              <button
                className="mbtn plain"
                onClick={() => {
                  buzz(8);
                  onRestart();
                }}
              >
                <span>Пройти ще раз</span>
              </button>
            ) : (
              <a className="mbtn plain" href={`${SITE_URL}/`}>
                <span>Пройти тест</span>
              </a>
            )}
          </div>
          {misses.length > 0 && (
            <section className="reread">
              <h2>Варто перечитати</h2>
              <ol>
                {misses.map((m) => (
                  <li key={m.id}>
                    <p className="rq">{m.prompt}</p>
                    <p className="ra">
                      Відповідь: <b>{m.correct}</b> {m.options.find((o) => o.key === m.correct)?.text}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export function ResultPage({ level }: { level: Level }) {
  return <ResultBody level={level} />;
}

export default function MemphisSkin({ quiz }: { quiz: QuizApi }) {
  const { screen, history, score, level } = quiz;
  useKeys(quiz);

  if (screen === "intro") {
    return (
      <main className="memphis split intro">
        <Decor variant="intro" />
        <div className="splitInner">
          <div className="left">
            <CoverCard />
          </div>
          <div className="right">
            <Logo />
            <h1 className="titleBlock">{intro.title}</h1>
            <p className="lead">{intro.lead}</p>
            <p className="meta">{intro.meta}</p>
            <div className="actions">
              <button
                className="mbtn accent"
                onClick={() => {
                  buzz(8);
                  quiz.start();
                }}
              >
                <span>Почати тест</span>
                <Arrow />
              </button>
              <Share url={`${SITE_URL}/`} text={TEST_SHARE_TEXT} label="Поділитися тестом" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (screen === "question" || screen === "reveal") return <Sheet quiz={quiz} />;

  return <ResultBody level={level} score={score} onRestart={quiz.restart} showMisses history={history} />;
}
