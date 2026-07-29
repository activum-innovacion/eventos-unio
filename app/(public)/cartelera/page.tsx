"use client";

import { ScreeningCard } from "@/components/ScreeningCard";
import { useScreenings } from "@/lib/useScreenings";
import { useLang } from "@/lib/i18n";

export default function CarteleraPage() {
  const { t } = useLang();
  const { screenings, error, now } = useScreenings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="brand-heading text-2xl text-ink">{t.carteleraTitle}</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {t.carteleraIntro}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-coral/30 bg-coral/10 p-4 text-sm text-coral">
          {t.errorSchedule}
        </div>
      )}

      {!screenings && !error && (
        <div className="space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-cream" />
          ))}
        </div>
      )}

      {screenings && screenings.length === 0 && (
        <p className="rounded-xl border border-line bg-card p-6 text-center text-sm text-muted">
          {t.noSessions}
        </p>
      )}

      {screenings && screenings.length > 0 && (
        <div className="space-y-2.5">
          {screenings.map((s, i) => (
            <div
              key={s.id}
              className="animate-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <ScreeningCard screening={s} now={now} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
