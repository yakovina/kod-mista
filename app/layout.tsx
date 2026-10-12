import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./skins/book/book.css";
import { SITE_URL, TEST_SHARE_TITLE } from "./share";

const TITLE = "Код міста · Тест Хмарочоса";
const DESC =
  "Вісім питань про будівлі, назви вулиць і пам’ятники. Перевірте, як добре ви читаєте своє місто.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  openGraph: {
    title: TEST_SHARE_TITLE,
    description: DESC,
    url: `${SITE_URL}/`,
    siteName: "Хмарочос",
    locale: "uk_UA",
    type: "website",
    images: [{ url: `${SITE_URL}/og-test.png`, width: 1200, height: 630, alt: TEST_SHARE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TEST_SHARE_TITLE,
    description: DESC,
    images: [`${SITE_URL}/og-test.png`],
  },
};

export const viewport: Viewport = { themeColor: "#F3E6C4" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
