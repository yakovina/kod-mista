// Статистика проходжень (Google Form). Вимкнена, доки не заповнено FORM:
// створіть форму з полями «бали», «рівень», Q1..Q8, візьміть action
// (…/formResponse) і entry-ідентифікатори полів — і тест почне слати дані.

export const FORM = {
  action: "",
  entries: {
    score: "",
    level: "",
    q: ["", "", "", "", "", "", "", ""],
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

const formReady = () =>
  FORM.action !== "" &&
  FORM.entries.score !== "" &&
  FORM.entries.level !== "" &&
  FORM.entries.q.every((e) => e !== "");

/** Тихо відправляє результат; помилки ігноруємо, щоб не заважати користувачу. */
export function sendStats(payload: ResultStat): void {
  if (!formReady()) return;
  try {
    const params = new URLSearchParams();
    params.set(FORM.entries.score, String(payload.score));
    params.set(FORM.entries.level, payload.level);
    for (const a of payload.answers) {
      const entry = FORM.entries.q[a.id - 1];
      if (entry) params.set(entry, a.picked);
    }
    fetch(FORM.action, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
