import * as fileStore from "./store.file";
import * as pgStore from "./store.pg";

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
} = impl;

export type {
  ScreeningInput,
  NewCandidateInput,
  CandidatePatch,
  VoteResult,
} from "./types";
