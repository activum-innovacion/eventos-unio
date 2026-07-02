import { promises as fs } from "fs";
import path from "path";
import type {
  Candidate,
  CandidateStatus,
  CandidateView,
  DB,
  Screening,
} from "./types";
import { seed } from "./seed";

/**
 * Almacén persistente sencillo respaldado por un fichero JSON.
 *
 * Suficiente para desarrollo local y servidores con disco persistente. En
 * serverless (Vercel) el sistema de ficheros es de solo lectura: ahí cae a
 * memoria (no persiste) como red de seguridad. Para producción real hay que
 * sustituir esta capa por una base de datos + almacenamiento de imágenes
 * (ver README). Toda la app habla con el almacén solo a través de estas
 * funciones, así que el cambio queda aislado aquí.
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

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const POSTER_PALETTE: Array<{ from: string; to: string }> = [
  { from: "#2563eb", to: "#db2777" },
  { from: "#0d9488", to: "#eab308" },
  { from: "#7c3aed", to: "#f97316" },
  { from: "#e11d48", to: "#4f46e5" },
  { from: "#0891b2", to: "#a78bfa" },
  { from: "#b45309", to: "#facc15" },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
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

// ---------------------------------------------------------------------------
// Cartelera (screenings)
// ---------------------------------------------------------------------------

export async function getScreenings(): Promise<Screening[]> {
  const db = await readDb();
  return sortScreenings(db.screenings);
}

export type ScreeningInput = {
  title: string;
  year: number;
  genre: string;
  duration: number;
  rating: string;
  synopsis: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
};

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

// ---------------------------------------------------------------------------
// Candidatas (votaciones + propuestas)
// ---------------------------------------------------------------------------

/** Público: solo candidatas aprobadas, ordenadas por votos. */
export async function getCandidates(
  deviceId?: string
): Promise<CandidateView[]> {
  const db = await readDb();
  return db.candidates
    .filter((c) => c.status === "approved")
    .map((c) => toView(db, c, deviceId))
    .sort((a, b) => b.votes - a.votes || a.title.localeCompare(b.title));
}

/** Admin: todas las candidatas (aprobadas + pendientes). */
export async function getAllCandidates(): Promise<CandidateView[]> {
  const db = await readDb();
  return db.candidates
    .map((c) => toView(db, c))
    .sort(
      (a, b) =>
        // pendientes primero, luego por votos
        Number(a.status === "approved") - Number(b.status === "approved") ||
        b.votes - a.votes ||
        a.title.localeCompare(b.title)
    );
}

export type NewCandidateInput = {
  title: string;
  genre: string;
  synopsis: string;
  year?: number;
  proposedBy?: string;
  imageUrl?: string;
};

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

export type CandidatePatch = Partial<
  Pick<Candidate, "title" | "genre" | "synopsis" | "year" | "imageUrl">
>;

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

export type VoteResult = { id: string; votes: number; hasVoted: boolean };

export async function toggleVote(
  candidateId: string,
  deviceId: string
): Promise<VoteResult | null> {
  return withLock(async (db) => {
    const c = db.candidates.find((x) => x.id === candidateId);
    // Solo se puede votar a candidatas aprobadas.
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
