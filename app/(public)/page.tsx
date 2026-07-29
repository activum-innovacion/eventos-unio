"use client";

import Link from "next/link";
import { useMemo } from "react";
import { NextUpHero } from "@/components/NextUpHero";
import { ScreeningCalendar } from "@/components/ScreeningCalendar";
import { useScreenings } from "@/lib/useScreenings";
import { daysUntil } from "@/lib/format";
import { useLang } from "@/lib/i18n";

export default function InicioPage() {
  const { t } = useLang();
  const { screenings, error, now } = useScreenings();

  const next = useMemo(() => {
    if (!screenings) return null;
    return screenings.find((s) => daysUntil(s.date, now) >= 0) ?? null;
  }, [screenings, now]);

  return (
    <div className="space-y-6">
      <h1 className="sr-only">{t.appName} · ÜNIO Madrid</h1>

      {error && (
        <div className="rounded-xl border border-coral/30 bg-coral/10 p-4 text-sm text-coral">
          {t.errorSchedule}
        </div>
      )}

      {!screenings && !error && (
        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-2xl bg-cream" />
          <div className="h-80 animate-pulse rounded-2xl bg-cream" />
        </div>
      )}

      {screenings && (
        <>
          {next ? (
            <NextUpHero screening={next} now={now} />
          ) : (
            <div className="rounded-2xl border border-line bg-card p-6 text-center text-sm text-muted">
              {t.noUpcoming}
            </div>
          )}

          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                {t.calendar}
              </h2>
              <Link
                href="/cartelera"
                className="text-xs font-bold text-indigo hover:underline"
              >
                {t.seeFullSchedule}
              </Link>
            </div>
            <ScreeningCalendar screenings={screenings} now={now} />
          </section>
        </>
      )}
    </div>
  );
}
