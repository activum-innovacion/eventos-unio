"use client";

import { useEffect, useMemo, useState } from "react";
import type { Screening } from "@/lib/types";
import {
  formatDateLong,
  formatDuration,
  parseLocalDate,
  relativeLabel,
} from "@/lib/format";
import { useLang } from "@/lib/i18n";
import { Poster } from "./Poster";
import { ClockIcon, PinIcon } from "./icons";

const WEEKDAYS = {
  es: ["L", "M", "X", "J", "V", "S", "D"],
  en: ["M", "T", "W", "T", "F", "S", "S"],
};
const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ScreeningCalendar({
  screenings,
  now,
}: {
  screenings: Screening[];
  now: Date;
}) {
  const { lang, t } = useLang();
  const locale = lang === "en" ? "en-GB" : "es-ES";

  const byDate = useMemo(() => {
    const m = new Map<string, Screening>();
    for (const s of screenings) if (!m.has(s.date)) m.set(s.date, s);
    return m;
  }, [screenings]);

  const todayKey = keyOf(now.getFullYear(), now.getMonth(), now.getDate());

  const upcoming = useMemo(
    () =>
      screenings.find((s) => s.date >= todayKey) ??
      screenings[screenings.length - 1],
    [screenings, todayKey]
  );

  const initial = upcoming ? parseLocalDate(upcoming.date) : now;
  const [view, setView] = useState({
    year: initial.getFullYear(),
    month: initial.getMonth(),
  });
  // Fecha con el modal abierto (null = cerrado)
  const [openDate, setOpenDate] = useState<string | null>(null);
  const openScreening = openDate ? byDate.get(openDate) : undefined;
  const openPending = !!openScreening?.pendingVote;
  const openTitle = openScreening
    ? openPending
      ? openScreening.title?.trim() || t.pendingTitle
      : openScreening.title
    : "";

  // Cerrar con Escape + bloquear scroll del fondo mientras está abierto
  useEffect(() => {
    if (!openScreening) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDate(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [openScreening]);

  const monthLabel = cap(
    new Date(view.year, view.month, 1).toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    })
  );

  const firstWeekday = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shift(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
      {/* Cabecera de mes */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label={lang === "en" ? "Previous month" : "Mes anterior"}
          onClick={() => shift(-1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink transition-colors hover:border-indigo hover:text-indigo"
        >
          ‹
        </button>
        <span className="brand-heading text-sm text-ink">{monthLabel}</span>
        <button
          type="button"
          aria-label={lang === "en" ? "Next month" : "Mes siguiente"}
          onClick={() => shift(1)}
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-ink transition-colors hover:border-indigo hover:text-indigo"
        >
          ›
        </button>
      </div>

      {/* Días de la semana */}
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[0.62rem] font-bold uppercase tracking-wide text-muted">
        {WEEKDAYS[lang].map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>

      {/* Rejilla */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const k = keyOf(view.year, view.month, day);
          const has = byDate.has(k);
          const pending = has && !!byDate.get(k)?.pendingVote;
          const isToday = k === todayKey;
          const isNext = upcoming?.date === k;
          const isPast = k < todayKey;

          let cls = "text-ink-soft/70 hover:bg-cream";
          if (isNext) cls = "bg-indigo text-white font-bold shadow-sm";
          else if (has && !isPast)
            cls = "bg-indigo/[0.12] font-bold text-indigo-ink hover:bg-indigo/20";
          else if (has && isPast) cls = "bg-cream font-semibold text-muted";

          return (
            <button
              key={k}
              type="button"
              disabled={!has}
              onClick={() => setOpenDate(k)}
              aria-label={
                has
                  ? lang === "en"
                    ? `View session on the ${day}`
                    : `Ver sesión del ${day}`
                  : lang === "en"
                    ? `${day}, no session`
                    : `${day}, sin sesión`
              }
              className={`relative grid aspect-square place-items-center rounded-lg text-sm transition-colors disabled:cursor-default ${cls} ${
                isToday && !isNext ? "ring-1 ring-indigo/50" : ""
              }`}
            >
              {day}
              {has && !isNext && (
                <span
                  className={`absolute bottom-1 h-1 w-1 rounded-full ${
                    pending ? "bg-tan" : "bg-indigo"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-muted">{t.tapMarkedDay}</p>

      {/* Modal de la sesión */}
      {openScreening && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${t.pendingTitle}: ${openTitle}`}
          onClick={() => setOpenDate(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-in relative w-full max-w-sm rounded-2xl bg-card p-4 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpenDate(null)}
              aria-label={t.close}
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-cream text-ink-soft transition-colors hover:bg-line"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="flex gap-4">
              <Poster
                poster={openScreening.poster}
                imageUrl={openScreening.imageUrl}
                pending={openPending}
                title={openTitle}
                className="h-40 w-28 shrink-0 shadow-sm"
                size="lg"
              />
              <div className="min-w-0 flex-1 pr-6">
                <span className="mb-1.5 inline-block rounded-full bg-indigo/10 px-2 py-0.5 text-[0.62rem] font-semibold text-indigo-ink">
                  {relativeLabel(openScreening.date, now, lang)}
                </span>
                <h3 className="text-lg font-extrabold leading-tight text-ink">
                  {openTitle}
                </h3>
                {openPending ? (
                  <p className="mt-0.5 text-xs font-semibold text-indigo">
                    {t.pendingTag}
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-muted">
                    {openScreening.genre} · {openScreening.year} ·{" "}
                    {formatDuration(openScreening.duration)}
                  </p>
                )}
                <p className="mt-2 text-sm font-semibold text-ink">
                  {formatDateLong(openScreening.date, lang)}
                </p>
                <div className="mt-1.5 flex flex-col gap-1 text-xs">
                  <span className="inline-flex items-center gap-1.5 font-bold text-ink">
                    <ClockIcon className="h-3.5 w-3.5 text-indigo" />
                    {openScreening.time} h
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    <PinIcon className="h-3.5 w-3.5 text-indigo" />
                    {openScreening.location}
                  </span>
                </div>
              </div>
            </div>

            {openPending ? (
              <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-ink-soft">
                {t.pendingExpanded}
              </p>
            ) : (
              openScreening.synopsis && (
                <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-ink-soft">
                  {openScreening.synopsis}
                </p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
