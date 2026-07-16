import type { Screening } from "./types";
import { daysUntil, parseLocalDate } from "./format";

/** La votación se cierra este nº de días antes de la sesión pendiente. */
export const VOTING_CLOSE_DAYS = 3;

export type VotingStatus = {
  /** Hay una próxima sesión pendiente de votación programada */
  hasPending: boolean;
  /** ¿Se puede votar ahora mismo? */
  open: boolean;
  /** Fecha (YYYY-MM-DD) de esa sesión pendiente */
  sessionDate?: string;
  /** Último día para votar (YYYY-MM-DD) = sesión − VOTING_CLOSE_DAYS */
  closeDate?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Estado de la votación según la próxima sesión "pendiente de votación".
 * Regla: la votación se cierra VOTING_CLOSE_DAYS días antes de esa sesión.
 * Si no hay ninguna sesión pendiente programada, la votación queda abierta.
 */
export function votingStatus(
  screenings: Screening[],
  now: Date = new Date()
): VotingStatus {
  const next = screenings
    .filter((s) => s.pendingVote && daysUntil(s.date, now) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  if (!next) return { hasPending: false, open: true };

  const daysLeft = daysUntil(next.date, now);
  const open = daysLeft >= VOTING_CLOSE_DAYS;
  const sd = parseLocalDate(next.date);
  const closeDate = toKey(
    new Date(sd.getFullYear(), sd.getMonth(), sd.getDate() - VOTING_CLOSE_DAYS)
  );

  return { hasPending: true, open, sessionDate: next.date, closeDate };
}
