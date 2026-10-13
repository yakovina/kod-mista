"use client";

// Скін «Вітраж на світлій стіні»: інтерфейс як одне вітражне вікно на паперовій
// стіні. Панелі — біле скло в тонкій вугільній оправі (тій самій лінії, що й
// контур персонажів); колір з'являється лише там, де «вмикається світло»:
// кнопка дії, правильна відповідь, значок балу, засвічені вікна прогресу.
// Справжня мозаїка — лише готові файли ілюстраторки, у ложі затирки.

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { QuizApi } from "../../useQuiz";
import { intro, levels, questions, type Level, type Question } from "../../../data/quiz";
import { asset } from "../../bp";
import { SITE_URL, TEST_SHARE_TEXT, resultShareUrl } from "../../share";
import { COVER_ALT, buzz, glide, useKeys } from "../common";

/** Підписи інтерфейсу (не контент тесту) — усі в одному місці. */
const UI = {
  start: "Почати тест",
  next: "Наступне питання",
  finish: "Мій результат",
  right: (k: string) => `Правильно — ${k}`,
  wrong: (k: string) => `Правильна відповідь — ${k}`,
  again: "Пройти ще раз",
  take: "Пройти тест",
  shareTest: "Поділитися тестом",
  shareResult: "Поділитися результатом",
  copy: "Копіювати",
  copied: "Скопійовано",
  other: "Інше…",
  answers: "Ваші відповіді",
  foot: ["Хмарочос", "Код міста", "Джерела відповідей — у поясненнях до кожного питання"],
  nf: "Такої сторінки на фасаді немає",
  home: "На початок",
};

const Check = () => (
  <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2.5 7.5l3 3 6-6.5" />
  </svg>
);
const Cross = () => (
  <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
  </svg>
);

function Wordmark() {
  return (
    <div className="brandRow">
      <a className="brand" href="https://hmarochos.kiev.ua/" target="_blank" rel="noopener noreferrer">
        Хмарочос
      </a>
      <span className="brandSub">Код міста</span>
    </div>
  );
}

function Foot() {
  return (
    <footer className="foot">
      <p>
        {UI.foot.map((t, i) => (
          <span key={t}>
            {i > 0 && <i className="dot"> · </i>}
            {t}
          </span>
        ))}
      </p>
    </footer>
  );
}

/** Вісім вікон прогресу у верхній смузі: next / now / done (правильність не кодується). */
function Windows({ idx, total, answered }: { idx: number; total: number; answered: boolean }) {
  return (
    <div className="windows" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={idx + 1} aria-label={`Питання ${idx + 1} з ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const s = i < idx || (i === idx && answered) ? "done" : i === idx ? "now" : "next";
        return <i key={i} className={`win ${s}${i === 5 ? " w6" : ""}`} />;
      })}
    </div>
  );
}

/** Елемент ілюстраторки, прив'язаний до конкретного блоку. */
function Deco({ name, cls }: { name: string; cls: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`deco ${cls} ${name}`} src={asset(`/art/deco-${name}.webp`)} alt="" aria-hidden loading="lazy" />;
}

/** Мозаїка в ложі затирки. */
function Bed({ src, alt, cls }: { src: string; alt: string; cls: string }) {
  return (
    <figure className={`bed ${cls}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(src)} alt={alt} />
    </figure>
  );
}

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
      const p = Math.min(1, (now - t0) / 600);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n}</>;
}

/** Пояснення: перше речення — окремий абзац як головна думка. */
function Explanation({ text }: { text: string }) {
  const m = text.match(/^(.+?[.!?])\s+([\s\S]+)$/);
  if (!m) return <p className="lede">{text}</p>;
  return (
    <>
      <p className="lede">{m[1]}</p>
      <p className="explain">{m[2]}</p>
    </>
  );
}

function Sources({ q }: { q: Question }) {
  return (
    <p className="srcs">
      <span>{q.sources.length > 1 ? "Джерела:" : "Джерело:"}</span>{" "}
      {q.sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 && <i className="dot"> · </i>}
          <a href={s.url} target="_blank" rel="noopener noreferrer">
            {s.label}
          </a>
        </span>
      ))}
    </p>
  );
}

/** Картка пояснення: на екрані відповіді з декором на оправі, у плитках — без. */
function AnswerCard({ q, ok, idx, deco, cardRef, id }: { q: Question; ok: boolean | null; idx: number; deco?: boolean; cardRef?: React.Ref<HTMLElement>; id?: string }) {
  return (
    <section className={`pane acard${deco ? " withDeco" : ""}`} ref={cardRef} tabIndex={-1} aria-live="polite" id={id}>
      {deco && <Deco name={idx % 2 === 0 ? "sputnik" : "atom"} cls="d-onCard" />}
      <p className="verdict">
        <i className={`win ${ok === false ? "miss" : "ok"}`} />
        {ok ? UI.right(q.correct) : UI.wrong(q.correct)}
      </p>
      <Explanation text={q.explanation} />
      <Sources q={q} />
    </section>
  );
}

const FB = "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z";
const TG = "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z";

/** Окремі кнопки поширення; «Інше…» — лише на тачі з navigator.share. */
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
      setTimeout(() => setCopied(false), 1500);
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
      <div className={`shareGrid${native ? " four" : ""}`}>
        <button type="button" className="btn plain sbtn" onClick={() => popup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}>
          <svg viewBox="0 0 24 24" aria-hidden><path d={FB} fill="currentColor" /></svg>
          <span>Facebook</span>
        </button>
        <button type="button" className="btn plain sbtn" onClick={() => popup(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`)}>
          <svg viewBox="0 0 24 24" aria-hidden><path d={TG} fill="currentColor" /></svg>
          <span>Telegram</span>
        </button>
        <button type="button" className={`btn plain sbtn${copied ? " isCopied" : ""}`} onClick={copy}>
          {copied ? (
            <Check />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
            </svg>
          )}
          <span>{copied ? UI.copied : UI.copy}</span>
        </button>
        {native && (
          <button type="button" className="btn plain sbtn" onClick={more}>
            <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12M7 8l5-5 5 5M5 14v7h14v-7" />
            </svg>
            <span>{UI.other}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ——— екран питання / відповіді ———
function Sheet({ quiz }: { quiz: QuizApi }) {
  const { screen, q, idx, total, picked } = quiz;
  const answered = screen === "reveal";
  const ok = picked === q.correct;
  const promptRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  // після відповіді — у тому ж кадрі гортаємо до картки так, щоб виступ декору лишився у вікні
  useLayoutEffect(() => {
    if (screen === "question") {
      promptRef.current?.focus({ preventScroll: true });
      return;
    }
    if (screen !== "reveal" || !cardRef.current) return;
    const el = cardRef.current;
    el.focus({ preventScroll: true });
    const off = window.matchMedia("(min-width: 900px)").matches ? 64 : 48;
    const top = el.getBoundingClientRect().top + window.scrollY - off;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) window.scrollTo(0, top);
    else glide(top, 320);
  }, [screen, idx]);

  return (
    <main className="vitrazh sheet" key={q.id}>
      <div className="col col-q">
        <header className="bar">
          <Wordmark />
          <Windows idx={idx} total={total} answered={answered} />
        </header>

        <section className="pane qpane in">
          <p className="topic">
            <i className="win ok" />
            <span>{q.topic}</span>
            <span className="n">
              {" "}· {idx + 1} з {total}
            </span>
          </p>
          {q.context && <p className="context">{q.context}</p>}
          <h2 className="prompt" ref={promptRef} tabIndex={-1}>
            {q.prompt}
          </h2>
        </section>

        <ol className={answered ? "opts done" : "opts"}>
          {q.options.map((o, i) => {
            const state = !answered ? "" : o.key === q.correct ? " isRight" : o.key === picked ? " isWrong" : " isRest";
            return (
              <li key={o.key} className="in" style={{ animationDelay: `${40 * (i + 1)}ms` }}>
                <button
                  className={`pane opt${state}`}
                  disabled={answered}
                  onClick={() => {
                    buzz(o.key === q.correct ? 18 : [28, 45, 28]);
                    quiz.answer(o.key);
                  }}
                  aria-keyshortcuts={String(i + 1)}
                >
                  <span className="k">{state === " isRight" ? <Check /> : state === " isWrong" ? <Cross /> : o.key}</span>
                  <span className="t">{o.text}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {answered && <AnswerCard q={q} ok={ok} idx={idx} deco cardRef={cardRef} />}
        {answered && (
          <button
            className="btn next"
            onClick={() => {
              buzz(8);
              quiz.next();
            }}
            aria-keyshortcuts="Enter"
          >
            {quiz.isLast ? UI.finish : UI.next}
          </button>
        )}
      </div>
      <Foot />
    </main>
  );
}

// ——— результат ———
function LevelScale({ current }: { current: Level }) {
  const at = levels.findIndex((l) => l.slug === current.slug);
  return (
    <div className={`scaleWrap at-${at}`}>
      <span className="here" aria-hidden>
        <i />
        ви тут
      </span>
      <ol className="scale" aria-label="Рівні результату">
        {levels.map((l) => (
          <li key={l.slug} className={`pane lvl ${l.slug === current.slug ? "on lit" : "off"}`} aria-current={l.slug === current.slug ? "true" : undefined}>
            <span className="name">{l.title}</span>
            <span className="range">{l.range}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Tiles({ history }: { history: boolean[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="answersBlock" aria-label={UI.answers}>
      <h2 className="h2">{UI.answers}</h2>
      <ol className="tiles">
        {questions.map((qq, i) => (
          <li key={qq.id} className="in" style={{ animationDelay: `${30 * i}ms` }}>
            <button
              type="button"
              className={`tile${open === i ? " isOpen" : ""}`}
              aria-label={`Питання ${i + 1}, ${qq.topic}, ${history[i] ? "правильно" : "хибно"}`}
              aria-expanded={open === i}
              aria-controls="tileCard"
              onClick={() => {
                buzz(8);
                setOpen(open === i ? null : i);
              }}
            >
              <span className="tp">{qq.topic}</span>
              <span className={`mk ${history[i] ? "ok" : "miss"}`}>{history[i] ? <Check /> : <Cross />}</span>
            </button>
          </li>
        ))}
      </ol>
      {open !== null && <AnswerCard key={open} q={questions[open]} ok={history[open] ? true : null} idx={open} id="tileCard" />}
    </section>
  );
}

function Figure({ level }: { level: Level }) {
  if (!level.character) return null;
  const small = level.character.replace(".webp", "-560.webp");
  return (
    <div className="figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(level.character)} srcSet={`${asset(small)} 1x, ${asset(level.character)} 2x`} alt={`Ілюстрація: ${level.title}`} />
    </div>
  );
}

function ResultBody({ level, score, onRestart, history }: { level: Level; score?: number; onRestart?: () => void; history?: boolean[] }) {
  const shareUrl = resultShareUrl(level.slug);
  const full = history && history.length === questions.length;
  return (
    <main className="vitrazh result">
      <div className="grain" aria-hidden />
      <div className="col col-r">
        <header className="bar">
          <Wordmark />
        </header>
        <Figure level={level} />
        <hr className="ground" />
        {score !== undefined && (
          <div className="score" aria-label={`${score} з ${questions.length} правильних`}>
            <b>
              <CountUp to={score} />
            </b>
            <small>з {questions.length}</small>
          </div>
        )}
        <h1 className="title">{level.title}</h1>
        {score !== undefined && <LevelScale current={level} />}
        <p className="lead">{level.description}</p>
        <div className="actions">
          {score !== undefined && <Share url={shareUrl} text={level.shareText} label={UI.shareResult} />}
          {onRestart ? (
            <button
              className="btn"
              onClick={() => {
                buzz(8);
                onRestart();
              }}
            >
              {UI.again}
            </button>
          ) : (
            <a className="btn" href={`${SITE_URL}/`}>
              {UI.take}
            </a>
          )}
        </div>
        <Bed src="/art/deco-river-h.webp" alt="" cls="divider" />
        {full && <Tiles history={history} />}
      </div>
      <Foot />
    </main>
  );
}

export function ResultPage({ level }: { level: Level }) {
  return <ResultBody level={level} />;
}

export function NotFound() {
  return (
    <main className="vitrazh notfound">
      <div className="col col-r">
        <header className="bar">
          <Wordmark />
        </header>
        <Deco name="arch" cls="d-arch" />
        <p className="nfText">{UI.nf}</p>
        <a className="btn plain" href={`${SITE_URL}/`}>
          {UI.home}
        </a>
      </div>
      <Foot />
    </main>
  );
}

export default function VitrazhSkin({ quiz }: { quiz: QuizApi }) {
  const { screen, history, score, level } = quiz;
  useKeys(quiz);

  if (screen === "intro") {
    return (
      <main className="vitrazh intro">
        <div className="grain" aria-hidden />
        <div className="col col-start">
          <header className="bar">
            <Wordmark />
          </header>
          <section className="hero">
            <div className="heroText">
              <h1 className="title">{intro.title}</h1>
              <p className="lead">{intro.lead}</p>
              <p className="meta">
                {intro.meta.split(" · ").map((t, i) => (
                  <span key={t}>
                    {i > 0 && <i className="dot"> · </i>}
                    {t}
                  </span>
                ))}
              </p>
              <button
                className="btn"
                onClick={() => {
                  buzz(8);
                  quiz.start();
                }}
              >
                {UI.start}
              </button>
            </div>
            <Bed src="/art/cover.jpg" alt={COVER_ALT} cls="cover" />
          </section>
          <Share url={`${SITE_URL}/`} text={TEST_SHARE_TEXT} label={UI.shareTest} />
          <Bed src="/art/deco-river-h.webp" alt="" cls="divider" />
        </div>
        <Foot />
      </main>
    );
  }

  if (screen === "question" || screen === "reveal") return <Sheet quiz={quiz} />;

  return <ResultBody level={level} score={score} onRestart={quiz.restart} history={history} />;
}
