// Статистика проходжень — як у попередніх тестах Хмарочоса: тест шле дані
// прямо в Google Form (formResponse), форма пише їх у Google-таблицю, а аркуш
// «stats» рахує зведення. Форму, таблицю й зведення створює docs/stats-setup.gs,
// він же друкує блок FORM нижче. Порожній FORM — нічого не надсилаємо.
//
// Два записи на проходження: «start» (натиснули «Почати тест») і «finish»
// (дійшли до результату: бали, рівень, обрані літери на кожне питання).
// З localhost нічого не шлемо, щоб розробка не псувала цифри; з ?test в адресі
// запис позначається host=test, і зведення його не рахує.

// Форма «Код міста — статистика» (створена docs/stats-setup.gs 13.10.2026).
// Таблиця з відповідями й аркушем «stats»: https://docs.google.com/spreadsheets/d/1z0D91bmRZWIe_-fM4-uwVLYakP7HARa7CwDk6-Z8k6Y/edit
export const FORM: { action: string; entries: Record<string, string> } = {
  action: "https://docs.google.com/forms/d/e/1FAIpQLSfU-I9fa4EB-IUn-1Tu-n2HsFnm89_KMnIRJlpJ9eZGD_pWCw/formResponse",
  entries: {
    run_id: "entry.1545268754",
    event: "entry.682969337",
    score: "entry.460226251",
    level: "entry.1545208560",
    q1: "entry.1162188768",
    q2: "entry.1702608491",
    q3: "entry.1403147410",
    q4: "entry.406057852",
    q5: "entry.1100570344",
    q6: "entry.617114602",
    q7: "entry.1039798652",
    q8: "entry.619905809",
    host: "entry.565881824",
  },
};

export interface AnswerStat {
  id: number;
  picked: string;
  ok: boolean;
}

export interface ResultStat {
  score: number;
  level: string;
  answers: AnswerStat[];
}

const FIELDS = ["run_id", "event", "score", "level", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "host"];

const formReady = () => FORM.action !== "" && FIELDS.every((f) => (FORM.entries[f] ?? "") !== "");

const isLocal = () => {
  const h = typeof location !== "undefined" ? location.hostname : "";
  return h === "" || h === "localhost" || h === "127.0.0.1" || h.endsWith(".local");
};

let runId = "";
const newRunId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

function post(fields: Record<string, string>) {
  if (!formReady() || isLocal() || typeof fetch === "undefined") return;
  try {
    const body = new URLSearchParams();
    // ?test в адресі — перевірочне проходження: host=test, у зведення не потрапляє
    const host = new URLSearchParams(location.search).has("test") ? "test" : location.hostname;
    const all: Record<string, string> = { ...fields, run_id: runId, host };
    for (const [k, v] of Object.entries(all)) if (FORM.entries[k]) body.set(FORM.entries[k], v);
    fetch(FORM.action, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }).catch(() => {});
  } catch {
    /* статистика не має ламати тест */
  }
}

/** Людина натиснула «Почати тест» (і «Пройти ще раз» — це нове проходження). */
export function trackStart(): void {
  runId = newRunId();
  post({ event: "start" });
}

/** Людина дійшла до результату. */
export function sendStats(payload: ResultStat): void {
  if (!runId) runId = newRunId();
  const fields: Record<string, string> = { event: "finish", score: String(payload.score), level: payload.level };
  for (const a of payload.answers) fields[`q${a.id}`] = a.picked;
  post(fields);
}
