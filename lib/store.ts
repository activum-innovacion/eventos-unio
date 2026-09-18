import * as fileStore from "./store.file";
import * as pgStore from "./store.pg";
import type { Screening } from "./types";
import { votingStatus } from "./voting";

/**
 * Selector de backend de datos:
 *  - Si hay base de datos configurada (DATABASE_URL / POSTGRES_URL) → Neon/Postgres.
 *  - Si no → fichero JSON local (desarrollo).
 * Toda la app importa desde aquí, así que el resto del código no cambia.
 */
const hasDb = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
const impl = hasDb ? pgStore : fileStore;

export const {
  getScreenings,
  addScreening,
  updateScreening,
  deleteScreening,
  getCandidates,
  getAllCandidates,
  addCandidate,
  approveCandidate,
  updateCandidate,
  deleteCandidate,
  toggleVote,
  getMeta,
  setMeta,
  clearAllVotes,
  addSurveyResponse,
  getSurveyResponses,
  deleteSurveyResponse,
} = impl;

const RESET_MARKER = "votes_reset_round";

/**
 * Reinicia los votos al empezar una nueva ronda de votación: cuando la próxima
 * sesión pendiente de votación cambia respecto a la última para la que se
 * reiniciaron, se borran todos los votos. Así los votos se mantienen visibles
 * durante el cierre (la comisión decide) y la siguiente ronda arranca a 0.
 */
export async function syncVotesForRound(
  screenings: Screening[],
  now: Date = new Date()
): Promise<void> {
  const status = votingStatus(screenings, now);
  if (!status.hasPending || !status.sessionDate) return;
  const marker = await getMeta(RESET_MARKER);
  if (marker !== status.sessionDate) {
    await clearAllVotes();
    await setMeta(RESET_MARKER, status.sessionDate);
  }
}

export type {
  ScreeningInput,
  NewCandidateInput,
  CandidatePatch,
  VoteResult,
} from "./types";
