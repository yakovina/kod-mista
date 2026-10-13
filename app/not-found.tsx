import type { Metadata } from "next";
import { NotFound } from "./skins";

export const metadata: Metadata = { title: "Сторінку не знайдено — Код міста" };

export default function NotFoundPage() {
  return <NotFound />;
}
