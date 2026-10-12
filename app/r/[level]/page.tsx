import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TOTAL, getLevelBySlug, levels } from "../../../data/quiz";
import { ResultCard, Topbar } from "../../skins";
import ShareButtons from "../../ShareButtons";
import { SITE_URL, resultShareUrl } from "../../share";

// Статично генеруємо лише три сторінки рівнів.
export const dynamicParams = false;
export function generateStaticParams() {
  return levels.map((l) => ({ level: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level } = await params;
  const lvl = getLevelBySlug(level);
  if (!lvl) return {};
  const title = `Мій результат — «${lvl.title}» · Код міста`;
  const ogImage = `${SITE_URL}/og-${lvl.slug}.png`;
  return {
    title,
    description: lvl.description,
    openGraph: {
      title,
      description: lvl.description,
      url: resultShareUrl(lvl.slug),
      siteName: "Хмарочос",
      locale: "uk_UA",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: lvl.title }],
    },
    twitter: { card: "summary_large_image", title, description: lvl.description, images: [ogImage] },
  };
}

export default async function ResultSharePage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const lvl = getLevelBySlug(level);
  if (!lvl) notFound();
  return (
    <main className="route screen result">
      <Topbar right="Листівка з тесту" />
      <div className="layout">
        <div className="visual">
          <ResultCard level={lvl} total={TOTAL} />
        </div>
        <div className="content">
          <p className="kicker">Результат · {lvl.range}</p>
          <h1 className="title mid">{lvl.title}</h1>
          <p className="lead">{lvl.description}</p>
          <div className="btnRow">
            <Link href="/" className="btn primary">
              <span>Пройти маршрут</span>
            </Link>
          </div>
          <ShareButtons url={resultShareUrl(lvl.slug)} text={lvl.shareText} title={lvl.title} label="Поділитися результатом" />
        </div>
      </div>
    </main>
  );
}
