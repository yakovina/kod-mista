"use client";

// Скін «Веселка»: Мемфіс на світлій стіні. Плоскі кольорові блоки з палітри
// ілюстрацій, чорнильний контур 2px і невеликі кольорові тіні-зсуви, смуги
// арки-веселки з обкладинки як візерунок, геометричне конфеті. Кожна літера
// варіанта — свій колір; вердикт — стікер на картці; на результаті — конфеті.
// Мозаїка ілюстраторки лишається лише там, де вона сидить на контенті.

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
  footAbout: "«Код міста» — тест Хмарочоса про будівлі, назви вулиць і пам’ятники",
  footCopy: "© Хмарочос, 2026",
  footSite: "hmarochos.kiev.ua",
  nf: "Такої сторінки на фасаді немає",
  home: "На початок",
};

/** Тріщина на оправі хибної відповіді — як на арці з обкладинки. */
const Crack = () => (
  <svg className="crack" viewBox="0 0 24 60" aria-hidden>
    <path d="M12 0 L9 14 L15 22 L8 36 L14 46 L10 60" />
  </svg>
);

const Arrow = () => (
  <svg className="arrow" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

/** Геометричне конфеті Мемфіса: кружечки, трикутники, зигзаги — у кольорах ілюстрацій. */
const BITS = ["c", "t", "z", "s", "c", "t", "s", "z", "c", "t", "c", "s", "z", "t", "c", "s", "t", "c"];
function Confetti() {
  return (
    <div className="confetti" aria-hidden>
      {BITS.map((b, i) => (
        <i
          key={i}
          className={`bit ${b} p${i % 4}`}
          style={{ left: `${(i * 37 + 5) % 100}%`, animationDelay: `${(i * 53) % 700}ms`, animationDuration: `${1900 + ((i * 131) % 900)}ms` }}
        />
      ))}
    </div>
  );
}

/** Декор-кластер із геометрії Мемфіса, прив'язаний до блоку (не до вікна). */
function Shapes({ cls }: { cls: string }) {
  return (
    <svg className={`shapes ${cls}`} viewBox="0 0 120 120" aria-hidden>
      <circle cx="22" cy="24" r="12" className="f-teal" />
      <path d="M70 8 L96 48 L44 48 Z" className="f-mustard" />
      <path d="M8 78 l10 -12 l10 12 l10 -12 l10 12 l10 -12 l10 12" className="s-terracotta" />
      <rect x="84" y="80" width="22" height="22" className="f-brick" transform="rotate(12 95 91)" />
      <circle cx="56" cy="100" r="5" className="f-ink" />
    </svg>
  );
}

const Redo = () => (
  <svg className="redo" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" />
  </svg>
);

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
      <a className="brand" href="https://hmarochos.kiev.ua/" target="_blank" rel="noopener noreferrer" aria-label="Хмарочос — відкрити сайт">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("/hmarochos_logo_new.svg")} alt="Хмарочос" width={87} height={32} />
      </a>
      <span className="brandSub">Код міста</span>
    </div>
  );
}

/** Футер усього сайту: стрічка-веселка, лого Хмарочоса, підпис і посилання. */
function Foot() {
  return (
    <footer className="foot">
      <div className="footIn">
        <a className="footLogo" href="https://hmarochos.kiev.ua/" target="_blank" rel="noopener noreferrer" aria-label="Хмарочос — відкрити сайт">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/hmarochos_logo_new.svg")} alt="Хмарочос" width={109} height={40} loading="lazy" />
        </a>
        <p className="footAbout">{UI.footAbout}</p>
        <p className="footMeta">
          <span>{UI.footCopy}</span>
          <i className="dot"> · </i>
          <a href="https://hmarochos.kiev.ua/" target="_blank" rel="noopener noreferrer">
            {UI.footSite}
          </a>
        </p>
      </div>
    </footer>
  );
}

/** Вісім вікон прогресу у верхній смузі: next / now / done (правильність не кодується). */
function Windows({ idx, total, answered }: { idx: number; total: number; answered: boolean }) {
  return (
    <div className="windows" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={idx + 1} aria-label={`Питання ${idx + 1} з ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const s = i < idx || (i === idx && answered) ? "done" : i === idx ? "now" : "next";
        return <i key={i} className={`win ${s}`} />;
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
function AnswerCard({ q, ok, deco, cardRef, id }: { q: Question; ok: boolean | null; deco?: boolean; cardRef?: React.Ref<HTMLElement>; id?: string }) {
  return (
    <section className={`pane acard${deco && ok ? " withDeco" : ""}${ok === false ? " miss" : ""}`} ref={cardRef} tabIndex={-1} aria-live="polite" id={id}>
      {deco && ok && <Deco name="firebird" cls="d-onCard bird" />}
      <div className="acardIn">
        <p className={`verdict sticker ${ok === false ? "miss" : "ok"}`}>
          {ok === false ? <Cross /> : <Check />}
          <span>{ok ? UI.right(q.correct) : UI.wrong(q.correct)}</span>
          {deco && ok && (
            <span className="burst" aria-hidden>
              {Array.from({ length: 10 }, (_, i) => (
                <i key={i} className={`b${i}`} />
              ))}
            </span>
          )}
        </p>
        <Explanation text={q.explanation} />
        <Sources q={q} />
      </div>
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
        <button type="button" className="sbtn fb" onClick={() => popup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}>
          <svg viewBox="0 0 24 24" aria-hidden><path d={FB} fill="currentColor" /></svg>
          <span>Facebook</span>
        </button>
        <button type="button" className="sbtn tg" onClick={() => popup(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`)}>
          <svg viewBox="0 0 24 24" aria-hidden><path d={TG} fill="currentColor" /></svg>
          <span>Telegram</span>
        </button>
        <button type="button" className={`sbtn copy${copied ? " isCopied" : ""}`} onClick={copy}>
          {copied ? (
            <Check />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
              <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
            </svg>
          )}
          <span>{copied ? UI.copied : UI.copy}</span>
        </button>
        {native && (
          <button type="button" className="sbtn more" onClick={more}>
            <svg viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
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
    const off = window.matchMedia("(min-width: 900px)").matches ? 72 : 64;
    const top = el.getBoundingClientRect().top + window.scrollY - off;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) window.scrollTo(0, top);
    else glide(top, 320);
  }, [screen, idx]);

  return (
    <main className="veselka sheet" key={q.id}>
      <div className="col col-q">
        <header className="bar">
          <Wordmark />
          <span className="count">
            {idx + 1} з {total}
          </span>
        </header>
        <Windows idx={idx} total={total} answered={answered} />

        <section className="pane qpane in">
          <p className="topic">
            <span className="chip">{q.topic}</span>
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
                  <span className="k">
                    {o.key}
                    {state === " isRight" ? <Check /> : state === " isWrong" ? <Cross /> : null}
                  </span>
                  {state === " isWrong" && <Crack />}
                  {state === " isRight" && <i className="gleam" aria-hidden />}
                  <span className="t">{o.text}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {answered && <AnswerCard q={q} ok={ok} deco cardRef={cardRef} />}
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
            <Arrow />
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


/** Смугаста арка з тріщиною — цитата обкладинки, тло для персонажа результату. */
function Arch() {
  const rings: [number, string][] = [
    [100, "a-ink"],
    [98, "a-900"],
    [90, "a-600"],
    [81, "a-500"],
    [72, "a-300"],
    [63, "a-card"],
    [56.5, "a-ink"],
    [55, "a-hole"],
  ];
  return (
    <svg className="arch" viewBox="0 0 200 100" preserveAspectRatio="xMidYMax meet" aria-hidden>
      {rings.map(([r, c]) => (
        <circle key={r} cx="100" cy="100" r={r} className={c} />
      ))}
      <path className="a-crack" d="M0 -99.5 L3.5 -91 L-2.5 -82 L3 -73 L-2 -64 L1 -56.5" transform="translate(100 100) rotate(-52)" />
    </svg>
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

function ResultBody({ level, score, onRestart }: { level: Level; score?: number; onRestart?: () => void }) {
  const shareUrl = resultShareUrl(level.slug);
  return (
    <main className="veselka result">
      {score !== undefined && <Confetti />}
      <div className="col col-r">
        <header className="bar">
          <Wordmark />
        </header>
        <section className={`poster pane lvl-${level.slug}`}>
          <Arch />
          <Figure level={level} />
          <Bed src="/art/deco-river-h.webp" alt="" cls="riverGround flow" />
          {score !== undefined && (
            <div className="score" aria-label={`${score} з ${questions.length} правильних`}>
              <b>
                <CountUp to={score} />
              </b>
              <small>з {questions.length}</small>
            </div>
          )}
        </section>
        <div className="titlePane pane mid">
          <h1 className="title">{level.title}</h1>
        </div>
        {score !== undefined && <LevelScale current={level} />}
        <section className="pane resCard">
          <p className="lead">{level.description}</p>
          {score !== undefined && <Share url={shareUrl} text={level.shareText} label={UI.shareResult} />}
        </section>
        <div className="resNext">
          {onRestart ? (
            <button
              type="button"
              className="again"
              onClick={() => {
                buzz(8);
                onRestart();
              }}
            >
              <Redo />
              {UI.again}
            </button>
          ) : (
            <a className="btn" href={`${SITE_URL}/`}>
              {UI.take}
              <Arrow />
            </a>
          )}
        </div>
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
    <main className="veselka notfound">
      <div className="col col-r">
        <header className="bar">
          <Wordmark />
        </header>
        <div className="nfBody">
          <Deco name="arch" cls="d-arch" />
          <div className="titlePane pane">
            <h1 className="title nfText">{UI.nf}</h1>
          </div>
          <a className="btn" href={`${SITE_URL}/`}>
            {UI.home}
            <Arrow />
          </a>
        </div>
      </div>
      <Foot />
    </main>
  );
}

export default function VeselkaSkin({ quiz }: { quiz: QuizApi }) {
  const { screen, score, level } = quiz;
  useKeys(quiz);

  if (screen === "intro") {
    return (
      <main className="veselka intro">
        <div className="col col-start">
          <header className="bar">
            <Wordmark />
          </header>
          <section className="hero">
            <div className="heroText">
              <div className="titlePane pane">
                <Deco name="sputnik" cls="d-perch" />
                <h1 className="title">{intro.title}</h1>
              </div>
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
                <Arrow />
              </button>
            </div>
            <div className="coverWrap">
              <Bed src="/art/cover.jpg" alt={COVER_ALT} cls="cover" />
              <Shapes cls="d-hero" />
            </div>
          </section>
          <Share url={`${SITE_URL}/`} text={TEST_SHARE_TEXT} label={UI.shareTest} />
        </div>
        <Foot />
      </main>
    );
  }

  if (screen === "question" || screen === "reveal") return <Sheet quiz={quiz} />;

  return <ResultBody level={level} score={score} onRestart={quiz.restart} />;
}
