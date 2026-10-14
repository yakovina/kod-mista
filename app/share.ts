// Публічна адреса задеплоєного сайту — шер завжди веде на неї (навіть у dev).
// Перевизначається змінною NEXT_PUBLIC_SITE_URL на етапі збірки.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yakovina.github.io/kod-mista";

export const TEST_SHARE_TITLE = "Код міста — тест Хмарочоса";

export const TEST_SHARE_TEXT =
  "Вісім питань про будівлі, назви вулиць і пам’ятники. Перевір, як добре ти читаєш своє місто:";

/** URL шер-сторінки конкретного результату: /r/{slug}/ */
export function resultShareUrl(slug: string): string {
  return `${SITE_URL}/r/${slug}/`;
}

/** Версія OG-картинок: міняємо, коли картинки перемальовано, щоб соцмережі взяли нові. */
export const OG_VERSION = "8";
