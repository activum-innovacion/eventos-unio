import { promises as fs } from "fs";
import path from "path";
import type {
  Candidate,
  CandidatePatch,
  CandidateStatus,
  CandidateView,
  DB,
  NewCandidateInput,
  Screening,
  ScreeningInput,
  VoteResult,
} from "./types";
import { seed } from "./seed";
import { POSTER_PALETTE, slugify } from "./store-util";

/**
 * Backend de datos respaldado por un fichero JSON (desarrollo local y
 * servidores con disco persistente). En serverless (fs de solo lectura) cae a
 * memoria como red de seguridad. Se usa cuando NO hay base de datos configurada.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

let writeLock: Promise<unknown> = Promise.resolve();
let memoryDb: DB | null = null;
let useMemory = false;

const clone = (db: DB): DB => JSON.parse(JSON.stringify(db)) as DB;

function fallbackToMemory(db?: DB): DB {
  useMemory = true;
  if (db) memoryDb = db;
  else if (!memoryDb) memoryDb = clone(seed);
  return memoryDb;
}

async function readDb(): Promise<DB> {
  if (useMemory) return memoryDb ?? fallbackToMemory();
  try {
    try {
      await fs.access(DB_PATH);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DB_PATH, JSON.stringify(seed, null, 2), "utf8");
    }
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw) as DB;
  } catch {
    return fallbackToMemory();
  }
}

async function writeDb(db: DB): Promise<void> {
  if (useMemory) {
    memoryDb = db;
    return;
  }
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch {
    fallbackToMemory(db);
  }
}

function withLock<T>(fn: (db: DB) => Promise<T> | T): Promise<T> {
  const run = async (): Promise<T> => fn(await readDb());
  const next = writeLock.then(run, run);
  writeLock = next.catch(() => undefined);
  return next;
}

function uniqueId(prefix: string, base: string, taken: Set<string>): string {
  const root = `${prefix}-${slugify(base) || "item"}`;
  let id = root;
  let n = 2;
  while (taken.has(id)) id = `${root}-${n++}`;
  return id;
}

function sortScreenings(screenings: Screening[]): Screening[] {
  return [...screenings].sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
  );
}

function toView(db: DB, c: Candidate, deviceId?: string): CandidateView {
  const voters = db.votes[c.id] ?? [];
  return {
    ...c,
    votes: voters.length,
    hasVoted: deviceId ? voters.includes(deviceId) : false,
  };
}

// --- Cartelera ---

export async function getScreenings(): Promise<Screening[]> {
  const db = await readDb();
  return sortScreenings(db.screenings);
}

export async function addScreening(input: ScreeningInput): Promise<Screening> {
  return withLock((db) => {
    const taken = new Set(db.screenings.map((s) => s.id));
    const palette =
      POSTER_PALETTE[db.screenings.length % POSTER_PALETTE.length];
    const screening: Screening = {
      id: uniqueId("scr", input.title, taken),
      poster: { emoji: "🎬", ...palette },
      ...input,
    };
    db.screenings.push(screening);
    return writeDb(db).then(() => screening);
  });
}

export async function updateScreening(
  id: string,
  patch: Partial<ScreeningInput>
): Promise<Screening | null> {
  return withLock(async (db) => {
    const s = db.screenings.find((x) => x.id === id);
    if (!s) return null;
    Object.assign(s, patch);
    await writeDb(db);
    return s;
  });
}

export async function deleteScreening(id: string): Promise<boolean> {
  return withLock(async (db) => {
    const before = db.screenings.length;
    db.screenings = db.screenings.filter((s) => s.id !== id);
    if (db.screenings.length === before) return false;
    await writeDb(db);
    return true;
  });
}

// --- Candidatas ---

export async function getCandidates(
  deviceId?: string
): Promise<CandidateView[]> {
  const db = await readDb();
  return db.candidates
    .filter((c) => c.status === "approved")
    .map((c) => toView(db, c, deviceId))
    .sort((a, b) => b.votes - a.votes || a.title.localeCompare(b.title));
}

export async function getAllCandidates(): Promise<CandidateView[]> {
  const db = await readDb();
  return db.candidates
    .map((c) => toView(db, c))
    .sort(
      (a, b) =>
        Number(a.status === "approved") - Number(b.status === "approved") ||
        b.votes - a.votes ||
        a.title.localeCompare(b.title)
    );
}

export async function addCandidate(
  input: NewCandidateInput,
  createdAt: string,
  status: CandidateStatus = "pending"
): Promise<CandidateView> {
  return withLock((db) => {
    const taken = new Set(db.candidates.map((c) => c.id));
    const prefix = status === "approved" ? "adm" : "usr";
    const id = uniqueId(prefix, input.title, taken);
    const palette =
      POSTER_PALETTE[db.candidates.length % POSTER_PALETTE.length];
    const candidate: Candidate = {
      id,
      title: input.title.trim(),
      genre: input.genre.trim() || "Sin categoría",
      synopsis: input.synopsis.trim(),
      year: input.year,
      proposedBy: input.proposedBy?.trim() || undefined,
      imageUrl: input.imageUrl,
      poster: { emoji: "🎬", ...palette },
      status,
      createdAt,
    };
    db.candidates.push(candidate);
    db.votes[id] = [];
    return writeDb(db).then(() => toView(db, candidate));
  });
}

export async function approveCandidate(
  id: string
): Promise<CandidateView | null> {
  return withLock(async (db) => {
    const c = db.candidates.find((x) => x.id === id);
    if (!c) return null;
    c.status = "approved";
    await writeDb(db);
    return toView(db, c);
  });
}

export async function updateCandidate(
  id: string,
  patch: CandidatePatch
): Promise<CandidateView | null> {
  return withLock(async (db) => {
    const c = db.candidates.find((x) => x.id === id);
    if (!c) return null;
    Object.assign(c, patch);
    await writeDb(db);
    return toView(db, c);
  });
}

export async function deleteCandidate(id: string): Promise<boolean> {
  return withLock(async (db) => {
    const before = db.candidates.length;
    db.candidates = db.candidates.filter((c) => c.id !== id);
    if (db.candidates.length === before) return false;
    delete db.votes[id];
    await writeDb(db);
    return true;
  });
}

export async function toggleVote(
  candidateId: string,
  deviceId: string
): Promise<VoteResult | null> {
  return withLock(async (db) => {
    const c = db.candidates.find((x) => x.id === candidateId);
    if (!c || c.status !== "approved") return null;
    const voters = db.votes[candidateId] ?? [];
    const idx = voters.indexOf(deviceId);
    if (idx >= 0) voters.splice(idx, 1);
    else voters.push(deviceId);
    db.votes[candidateId] = voters;
    await writeDb(db);
    return { id: candidateId, votes: voters.length, hasVoted: idx < 0 };
  });
}
