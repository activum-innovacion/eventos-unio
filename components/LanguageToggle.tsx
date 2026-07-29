"use client";

import { useLang } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

const LANGS: Lang[] = ["es", "en"];

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label={lang === "en" ? "Language" : "Idioma"}
      className="flex items-center rounded-full border border-line bg-cream p-0.5 text-[0.68rem] font-bold"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2 py-0.5 uppercase tracking-wide transition-colors ${
            lang === l ? "bg-indigo text-white" : "text-muted hover:text-ink"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
