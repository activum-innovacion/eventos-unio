import type { Lang } from "./types";

/** Utilidades de formato de fechas, evitando líos de zona horaria. */

const LOCALE: Record<Lang, string> = { es: "es-ES", en: "en-GB" };

/** Convierte "YYYY-MM-DD" en un Date local (no UTC). */
export function parseLocalDate(dateStr: string, time = "00:00"): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Viernes 3 de julio" / "Friday 3 July" */
export function formatDateLong(dateStr: string, lang: Lang = "es"): string {
  const d = parseLocalDate(dateStr);
  return cap(
    d.toLocaleDateString(LOCALE[lang], {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  );
}

/** { weekday: "vie", day: "3", month: "jul" } para la tira de fecha */
export function dateParts(
  dateStr: string,
  lang: Lang = "es"
): { weekday: string; day: string; month: string } {
  const d = parseLocalDate(dateStr);
  const loc = LOCALE[lang];
  return {
    weekday: cap(d.toLocaleDateString(loc, { weekday: "short" })).replace(".", ""),
    day: d.toLocaleDateString(loc, { day: "numeric" }),
    month: d.toLocaleDateString(loc, { month: "short" }).replace(".", ""),
  };
}

/** Días hasta la fecha, tomando el "hoy" del cliente. */
export function daysUntil(dateStr: string, now = new Date()): number {
  const target = parseLocalDate(dateStr);
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const t1 = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((t1.getTime() - t0.getTime()) / 86_400_000);
}

/** Etiqueta relativa amable: "Hoy", "Mañana", "En 3 días"… / "Today", "Tomorrow"… */
export function relativeLabel(
  dateStr: string,
  now = new Date(),
  lang: Lang = "es"
): string {
  const diff = daysUntil(dateStr, now);
  const T =
    lang === "en"
      ? {
          today: "Today",
          tomorrow: "Tomorrow",
          inDays: (n: number) => `In ${n} days`,
          yesterday: "Yesterday",
          past: "Already shown",
        }
      : {
          today: "Hoy",
          tomorrow: "Mañana",
          inDays: (n: number) => `En ${n} días`,
          yesterday: "Ayer",
          past: "Ya proyectada",
        };
  if (diff === 0) return T.today;
  if (diff === 1) return T.tomorrow;
  if (diff > 1) return T.inDays(diff);
  if (diff === -1) return T.yesterday;
  return T.past;
}

/** "1h 45min" a partir de minutos. */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
