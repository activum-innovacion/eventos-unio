/** Utilidades de formato de fechas para es-ES, evitando líos de zona horaria. */

/** Convierte "YYYY-MM-DD" en un Date local (no UTC). */
export function parseLocalDate(dateStr: string, time = "00:00"): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Viernes 3 de julio" */
export function formatDateLong(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return cap(
    d.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  );
}

/** { weekday: "vie", day: "3", month: "jul" } para la tira de fecha */
export function dateParts(dateStr: string): {
  weekday: string;
  day: string;
  month: string;
} {
  const d = parseLocalDate(dateStr);
  return {
    weekday: cap(d.toLocaleDateString("es-ES", { weekday: "short" })).replace(".", ""),
    day: d.toLocaleDateString("es-ES", { day: "numeric" }),
    month: d.toLocaleDateString("es-ES", { month: "short" }).replace(".", ""),
  };
}

/** Días hasta la fecha, tomando el "hoy" del cliente. */
export function daysUntil(dateStr: string, now = new Date()): number {
  const target = parseLocalDate(dateStr);
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const t1 = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((t1.getTime() - t0.getTime()) / 86_400_000);
}

/** Etiqueta relativa amable: "Hoy", "Mañana", "En 3 días", "Ya proyectada". */
export function relativeLabel(dateStr: string, now = new Date()): string {
  const diff = daysUntil(dateStr, now);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff > 1) return `En ${diff} días`;
  if (diff === -1) return "Ayer";
  return "Ya proyectada";
}

/** "1h 45min" a partir de minutos. */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}
