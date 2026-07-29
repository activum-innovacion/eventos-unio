"use client";

import { useState } from "react";
import type { Screening } from "@/lib/types";
import { Poster } from "./Poster";
import { ClockIcon, PinIcon } from "./icons";
import { dateParts, daysUntil, formatDuration, relativeLabel } from "@/lib/format";
import { useLang } from "@/lib/i18n";

export function ScreeningCard({
  screening,
  now,
}: {
  screening: Screening;
  now: Date;
}) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const { weekday, day, month } = dateParts(screening.date, lang);
  const days = daysUntil(screening.date, now);
  const rel = relativeLabel(screening.date, now, lang);
  const isPast = days < 0;
  const isToday = days === 0;
  const isPending = !!screening.pendingVote;
  const title = isPending
    ? screening.title?.trim() || t.pendingTitle
    : screening.title;

  const badgeClass = isPast
    ? "bg-cream text-muted"
    : isToday
      ? "bg-indigo text-white"
      : "bg-indigo/10 text-indigo-ink";

  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      aria-expanded={open}
      className={`w-full rounded-2xl border border-line bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md ${
        isPast ? "opacity-70" : ""
      }`}
    >
      <div className="flex gap-3">
        <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-cream py-2 text-center">
          <span className="text-[0.62rem] font-bold uppercase tracking-wide text-indigo">
            {weekday}
          </span>
          <span className="text-xl font-bold leading-none text-ink">{day}</span>
          <span className="text-[0.62rem] uppercase tracking-wide text-muted">
            {month}
          </span>
        </div>

        <Poster
          poster={screening.poster}
          imageUrl={screening.imageUrl}
          pending={isPending}
          title={title}
          className="h-[4.5rem] w-14"
          size="sm"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-bold text-ink">{title}</h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-semibold ${badgeClass}`}
            >
              {rel}
            </span>
          </div>

          {isPending ? (
            <p className="mt-0.5 truncate text-xs font-semibold text-indigo">
              🗳️ {t.decidedByVote}
            </p>
          ) : (
            <p className="mt-0.5 truncate text-xs text-muted">
              {screening.genre} · {screening.year}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-ink">
              <ClockIcon className="h-3.5 w-3.5 text-indigo" />
              {screening.time}
            </span>
            {!isPending && (
              <>
                <span className="text-muted">
                  {formatDuration(screening.duration)}
                </span>
                <span className="rounded border border-line px-1.5 py-px text-[0.6rem] text-muted">
                  {screening.rating}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ${
          open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-ink-soft">
            {isPending ? t.pendingExpanded : screening.synopsis}
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted">
            <PinIcon className="h-3.5 w-3.5 text-indigo" />
            {screening.location}
          </p>
        </div>
      </div>
    </button>
  );
}
