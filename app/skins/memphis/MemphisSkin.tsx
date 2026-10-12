"use client";

// Скін «Мемфіс з ілюстрації»: дизайн 80-х, зібраний із мотивів обкладинки —
// смугаста арка, зірки, супутник, сітка вікон. Плоскі фігури з товстим
// чорнильним контуром і жорсткими тінями-зсувами; кольори лише з ілюстрації.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { QuizApi } from "../../useQuiz";
import { intro, levels, questions, type Level } from "../../../data/quiz";
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

const FB = "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z";
const TG = "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z";

/** Окремі кнопки поширення: Facebook, Telegram, копіювати; на телефоні ще «Інше…». */
function Share({ url, text, label }: { url: string; text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);
  useEffect(() => {
    setNative(!!navigator.share && window.matchMedia("(pointer: coarse)").matches);
  }, []);
  const popup = (u: string) => {
    buzz(8);
    window.open(u, "_blank", "noopener,noreferrer,width=620,height=560");
  };
  const copy = async () => {
    buzz(8);
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      /* ignore */
    }
  };
  const more = async () => {
    buzz(8);
    try {
      await navigator.share({ text, url });
    } catch {
      /* скасовано */
    }
  };
  return (
    <div className="share">
      <p className="shareLabel">{label}</p>
      <div className="shareGrid">
        <button type="button" className="sbtn fb" onClick={() => popup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}>
          <svg viewBox="0 0 24 24" aria-hidden><path d={FB} /></svg>
          <span>Facebook</span>
        </button>
        <button type="button" className="sbtn tg" onClick={() => popup(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`)}>
          <svg viewBox="0 0 24 24" aria-hidden><path d={TG} /></svg>
          <span>Telegram</span>
        </button>
        <button type="button" className="sbtn copy" onClick={copy}>
          <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
          </svg>
          <span>{copied ? "Скопійовано" : "Копіювати"}</span>
        </button>
        {native && (
          <button type="button" className="sbtn more" onClick={more}>
            <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 3v12M7 8l5-5 5 5M5 14v7h14v-7" />
            </svg>
            <span>Інше…</span>
          </button>
        )}
      </div>
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

  // після відповіді — одразу, в тому ж кадрі, гортаємо до картки пояснення
  useLayoutEffect(() => {
    if (screen === "question") {
      promptRef.current?.focus({ preventScroll: true });
      return;
    }
    if (screen !== "reveal") return;
    const el = cardRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const top = el.getBoundingClientRect().top + window.scrollY - 28;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) window.scrollTo(0, top);
    else glide(top, 520);
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
              <p className="srcs">
                <span>{q.sources.length > 1 ? "Джерела:" : "Джерело:"}</span>{" "}
                {q.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && " · "}
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.label}
                    </a>
                  </span>
                ))}
              </p>
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

/** Коротке конфеті з фігур обкладинки — один раз. */
function Confetti() {
  const colors = ["#1e5866", "#e9c150", "#d66c46", "#93221a", "#79abb7"];
  const bits = Array.from({ length: 26 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    delay: `${(i % 7) * 0.08}s`,
    dur: `${1.4 + (i % 5) * 0.18}s`,
    color: colors[i % colors.length],
    shape: i % 3,
    rot: `${(i * 47) % 360}deg`,
  }));
  return (
    <div className="confetti" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className={`bit s${b.shape}`}
          style={{ left: b.left, animationDelay: b.delay, animationDuration: b.dur, background: b.shape === 2 ? "transparent" : b.color, color: b.color, ["--r" as string]: b.rot }}
        >
          {b.shape === 2 ? "★" : ""}
        </span>
      ))}
    </div>
  );
}

/** Шкала трьох рівнів з позначкою «ви тут». */
function LevelScale({ current }: { current: Level }) {
  return (
    <ol className="scale" aria-label="Рівні результату">
      {levels.map((l) => (
        <li key={l.slug} className={l.slug === current.slug ? "on" : ""}>
          <span className="lvlName">{l.title}</span>
          <span className="lvlRange">{l.range}</span>
          {l.slug === current.slug && <span className="here">ви тут</span>}
        </li>
      ))}
    </ol>
  );
}

function ResultBody({ level, score, onRestart, history }: { level: Level; score?: number; onRestart?: () => void; history?: boolean[] }) {
  const shareUrl = resultShareUrl(level.slug);
  return (
    <main className="memphis split result">
      <Decor variant="result" />
      {score !== undefined && <Confetti />}
      <div className="splitInner">
        <div className="left">
          <CoverCard />
        </div>
        <div className="right">
          <Logo />
          <div className="resultHead">
            <div className="scoreStar" aria-label={score !== undefined ? `${score} з ${questions.length}` : level.range}>
              <svg viewBox="0 0 120 120" aria-hidden>
                <polygon points="60,4 75,42 116,44 84,70 95,112 60,88 25,112 36,70 4,44 45,42" />
              </svg>
              <span className="scoreNum">
                {score !== undefined ? (
                  <>
                    <CountUp to={score} />
                    <small>з {questions.length}</small>
                  </>
                ) : (
                  <b className="rangeOnly">{level.range.split(" ")[0]}</b>
                )}
              </span>
            </div>
            <p className="score">{score !== undefined ? <>правильних<br />відповідей</> : <>результат<br />тесту</>}</p>
          </div>
          <h1 className="titleBlock mid">{level.title}</h1>
          <LevelScale current={level} />
          <p className="lead">{level.description}</p>
          {history && history.length === questions.length && (
            <section className="scorecard" aria-label="Ваші відповіді">
              <h2>Ваші відповіді</h2>
              <ol>
                {questions.map((qq, i) => (
                  <li key={qq.id} className={history[i] ? "ok" : "miss"}>
                    <span className="n">{i + 1}</span>
                    <span className="tp">{qq.topic}</span>
                    <span className="mk" aria-label={history[i] ? "правильно" : "помилка"}>
                      {history[i] ? "✓" : "✗"}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <div className="actions">
            <Share url={shareUrl} text={level.shareText} label="Поділитися результатом" />
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

  return <ResultBody level={level} score={score} onRestart={quiz.restart} history={history} />;
}
