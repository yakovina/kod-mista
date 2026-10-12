// Тимчасові ілюстрації, поки ілюстраторка не здала справжні:
// public/art/postcard-{1..8}.svg — лицьові боки листівок (16:9),
// public/art/char-{tourist,citizen,keeper}.svg — персонажі результатів (1:1).
// Справжні файли кладуться під тими самими іменами (можна .png/.jpg —
// тоді змінити postcardArt і character у data/quiz.ts).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "art");
mkdirSync(OUT, { recursive: true });

const C = { sky: "#79ABB7", blue: "#1E5866", apricot: "#D66C46", peach: "#F5D88C", ink: "#2E2E2B", white: "#E9E5DC" };

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Прості силуети за темою зупинки.
const scenes = {
  // стара будівля з фронтоном
  1: `<rect x="230" y="170" width="340" height="190" fill="${C.blue}"/><path d="M215 172 L400 90 L585 172 Z" fill="${C.ink}"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${258 + i * 62}" y="215" width="34" height="60" fill="${C.white}"/>`).join("")}<rect x="372" y="290" width="56" height="70" fill="${C.apricot}"/>`,
  // порт: хвилі, маяк, кран
  2: `<rect x="0" y="300" width="800" height="150" fill="${C.blue}"/>${[0, 1, 2, 3].map((i) => `<path d="M${i * 220} 320 q55 -26 110 0 t110 0" fill="none" stroke="${C.white}" stroke-width="6"/>`).join("")}<rect x="150" y="150" width="40" height="150" fill="${C.white}"/><rect x="140" y="130" width="60" height="26" fill="${C.ink}"/><path d="M520 300 V120 H700 M560 120 L520 160" fill="none" stroke="${C.ink}" stroke-width="12"/>`,
  // модерн: трапецієві вікна, висока покрівля, вежа
  3: `<rect x="200" y="200" width="400" height="160" fill="${C.white}"/><path d="M190 202 L260 130 H540 L610 202 Z" fill="${C.blue}"/><rect x="370" y="80" width="60" height="122" fill="${C.blue}"/><path d="M360 82 L400 40 L440 82 Z" fill="${C.ink}"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${226 + i * 60} 300 V250 L${240 + i * 60} 232 H${256 + i * 60} L${270 + i * 60} 250 V300 Z" fill="${C.apricot}"/>`).join("")}`,
  // конструктивізм: блоки і стрічкові вікна
  4: `<rect x="160" y="160" width="220" height="200" fill="${C.blue}"/><rect x="380" y="220" width="260" height="140" fill="${C.ink}"/><rect x="250" y="100" width="90" height="60" fill="${C.apricot}"/>${[0, 1, 2, 3].map((i) => `<rect x="176" y="${180 + i * 44}" width="188" height="16" fill="${C.white}"/>`).join("")}${[0, 1].map((i) => `<rect x="396" y="${246 + i * 50}" width="228" height="18" fill="${C.white}"/>`).join("")}`,
  // будинок «Слово»: С-подібний план
  5: `<path d="M560 110 H260 V350 H560 V280 H340 V180 H560 Z" fill="${C.blue}"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${280 + i * 54}" y="128" width="26" height="30" fill="${C.white}"/><rect x="${280 + i * 54}" y="302" width="26" height="30" fill="${C.white}"/>`).join("")}<text x="400" y="246" font-family="Lora, serif" font-size="64" font-weight="700" fill="${C.apricot}" text-anchor="middle">С</text>`,
  // арка в парку
  6: `<path d="M210 360 A190 190 0 0 1 590 360 L560 360 A160 160 0 0 0 240 360 Z" fill="${C.ink}"/>${[0, 1, 2, 3, 4].map((i) => `<circle cx="${110 + i * 150}" cy="340" r="${38 + (i % 2) * 14}" fill="#498C95"/>`).join("")}<rect x="0" y="356" width="800" height="94" fill="#498C95"/>`,
  // Держпром: каскад веж і переходи
  7: `<rect x="100" y="200" width="150" height="160" fill="${C.blue}"/><rect x="300" y="120" width="200" height="240" fill="${C.ink}"/><rect x="550" y="200" width="150" height="160" fill="${C.blue}"/><rect x="250" y="230" width="50" height="22" fill="${C.ink}"/><rect x="500" y="230" width="50" height="22" fill="${C.ink}"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="318" y="${140 + i * 42}" width="164" height="14" fill="${C.white}"/>`).join("")}${[0, 1, 2].map((i) => `<rect x="116" y="${222 + i * 42}" width="118" height="12" fill="${C.white}"/><rect x="566" y="${222 + i * 42}" width="118" height="12" fill="${C.white}"/>`).join("")}`,
  // вулична табличка зі старою назвою
  8: `<rect x="0" y="0" width="800" height="450" fill="#E9C150"/><rect x="200" y="150" width="400" height="140" fill="${C.ink}"/><rect x="214" y="164" width="372" height="112" fill="none" stroke="${C.white}" stroke-width="4"/><text x="400" y="200" font-family="Open Sans, sans-serif" font-size="22" fill="${C.white}" text-anchor="middle">вулиця</text><text x="400" y="248" font-family="Open Sans, sans-serif" font-size="40" font-weight="800" fill="${C.white}" text-anchor="middle" opacity="0.55">• • • • •</text><path d="M210 290 L590 150" stroke="${C.apricot}" stroke-width="10"/>`,
};

const captions = {
  1: "Стара будівля в центрі міста",
  2: "Порт Південного",
  3: "Будинок Полтавського губернського земства",
  4: "Конструктивістський Харків",
  5: "Будинок «Слово»",
  6: "Арка в Хрещатому парку",
  7: "Держпром",
  8: "Вулична табличка",
};

for (let id = 1; id <= 8; id++) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
<rect width="800" height="450" fill="${C.peach}"/>
<circle cx="660" cy="96" r="54" fill="${C.apricot}"/>
${scenes[id]}
<rect x="24" y="398" width="752" height="32" fill="${C.ink}"/>
<text x="38" y="420" font-family="Open Sans, sans-serif" font-size="16" font-weight="700" fill="${C.white}">${esc(`ЗАГЛУШКА · ${captions[id]}`)}</text>
</svg>
`;
  writeFileSync(join(OUT, `postcard-${id}.svg`), svg);
}

const chars = {
  tourist: { label: "Турист у своєму місті", prop: `<rect x="360" y="430" width="240" height="160" fill="${C.white}" stroke="${C.ink}" stroke-width="6" transform="rotate(180 480 510)"/><path d="M390 470 L440 540 L500 480 L570 560" fill="none" stroke="${C.blue}" stroke-width="6" stroke-dasharray="10 8"/>` },
  citizen: { label: "Допитливий містянин", prop: `<rect x="380" y="420" width="250" height="110" fill="${C.ink}" transform="rotate(-8 505 475)"/><text x="505" y="488" font-family="Open Sans, sans-serif" font-size="28" font-weight="800" fill="${C.white}" text-anchor="middle" transform="rotate(-8 505 475)">вул. ?</text>` },
  keeper: { label: "Хранитель коду міста", prop: `<circle cx="470" cy="470" r="40" fill="none" stroke="${C.apricot}" stroke-width="16"/><path d="M505 490 L620 560 M580 536 L600 506 M600 548 L620 518" stroke="${C.apricot}" stroke-width="16" stroke-linecap="square"/>` },
};

for (const [slug, c] of Object.entries(chars)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
<rect width="800" height="800" fill="${C.peach}"/>
<circle cx="640" cy="150" r="70" fill="${C.apricot}"/>
<rect x="0" y="640" width="800" height="160" fill="${C.sky}"/>
<circle cx="330" cy="250" r="80" fill="${C.ink}"/>
<path d="M210 640 V430 Q210 360 280 360 H380 Q450 360 450 430 V640 Z" fill="${C.blue}"/>
${c.prop}
<rect x="40" y="720" width="720" height="44" fill="${C.ink}"/>
<text x="58" y="750" font-family="Open Sans, sans-serif" font-size="20" font-weight="700" fill="${C.white}">${esc(`ЗАГЛУШКА · ${c.label}`)}</text>
</svg>
`;
  writeFileSync(join(OUT, `char-${slug}.svg`), svg);
}

console.log("placeholders: public/art оновлено");
