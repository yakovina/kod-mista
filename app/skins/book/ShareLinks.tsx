"use client";

import { useState } from "react";

function popup(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=620,height=560");
}

/**
 * Одна кнопка «Поділитися»: на телефоні — системне меню, на комп'ютері —
 * розгортає три кнопки (Facebook, Telegram, копіювати посилання).
 */
export default function ShareLinks({
  url,
  text,
  label = "Поділитися",
  primary = false,
}: {
  url: string;
  text: string;
  label?: string;
  /** Головна дія екрана — суцільна кнопка. */
  primary?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const onMain = async () => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse && navigator.share) {
      try {
        await navigator.share({ text, url });
      } catch {
        /* скасовано */
      }
      return;
    }
    setOpen((o) => !o);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="share">
      <button type="button" className={primary ? "btn primary" : "btn ghost"} onClick={onMain} aria-expanded={open}>
        <span>{label}</span>
      </button>
      {open && (
        <div className="shareRow">
          <button type="button" className="chip" onClick={() => popup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}>
            Facebook
          </button>
          <button
            type="button"
            className="chip"
            onClick={() => popup(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`)}
          >
            Telegram
          </button>
          <button type="button" className="chip" onClick={copy}>
            {copied ? "Скопійовано" : "Копіювати посилання"}
          </button>
        </div>
      )}
    </div>
  );
}
