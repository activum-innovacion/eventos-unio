import type { Screening } from "@/lib/types";
import { Poster } from "./Poster";
import { ClockIcon, PinIcon } from "./icons";
import { daysUntil, formatDateLong, formatDuration, relativeLabel } from "@/lib/format";

export function NextUpHero({
  screening,
  now,
}: {
  screening: Screening;
  now: Date;
}) {
  const rel = relativeLabel(screening.date, now);
  const days = daysUntil(screening.date, now);

  return (
    <section className="animate-in overflow-hidden rounded-2xl border border-indigo/25 bg-card shadow-md">
      <div className="flex items-center justify-between bg-indigo/[0.06] px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-indigo">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo" />
          </span>
          Próxima proyección
        </span>
        <span className="rounded-full bg-indigo px-2.5 py-1 text-xs font-bold text-white">
          {rel}
        </span>
      </div>

      <div className="flex gap-4 p-4">
        <Poster
          poster={screening.poster}
          imageUrl={screening.imageUrl}
          title={screening.title}
          className="h-36 w-24 shadow-sm"
          size="lg"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-xl font-extrabold leading-tight text-ink">
            {screening.title}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {screening.genre} · {screening.year} ·{" "}
            {formatDuration(screening.duration)}
          </p>

          <p className="mt-2 text-sm font-semibold text-ink">
            {formatDateLong(screening.date)}
          </p>

          <div className="mt-auto flex flex-col gap-1.5 pt-3 text-sm">
            <span className="inline-flex items-center gap-2 text-ink">
              <ClockIcon className="h-4 w-4 text-indigo" />
              <span className="font-bold">{screening.time} h</span>
            </span>
            <span className="inline-flex items-center gap-2 text-muted">
              <PinIcon className="h-4 w-4 text-indigo" />
              {screening.location}
            </span>
          </div>
        </div>
      </div>

      {days > 0 && (
        <div className="border-t border-line bg-cream px-4 py-2 text-center text-xs text-muted">
          Faltan <span className="font-bold text-indigo">{days}</span>{" "}
          {days === 1 ? "día" : "días"} para la sesión
        </div>
      )}
    </section>
  );
}
