"use client";

import { useState } from "react";

function popup(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,width=620,height=560");
}

/** Поширення текстовими посиланнями, як у книжковому наборі. */
export default function ShareLinks({ url, text, label = "Поділитися" }: { url: string; text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
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
    <p className="shareLinks">
      <span>{label}:</span>{" "}
      <button type="button" onClick={() => popup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`)}>
        Facebook
      </button>
      <span aria-hidden> · </span>
      <button
        type="button"
        onClick={() =>
          popup(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`)
        }
      >
        Telegram
      </button>
      <span aria-hidden> · </span>
      <button type="button" onClick={copy}>
        {copied ? "скопійовано" : "скопіювати посилання"}
      </button>
    </p>
  );
}
