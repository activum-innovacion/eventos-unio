import { neon } from "@neondatabase/serverless";
import type {
  CandidatePatch,
  CandidateStatus,
  CandidateView,
  Poster,
  Screening,
  ScreeningInput,
  NewCandidateInput,
  VoteResult,
} from "./types";
import { seed } from "./seed";
import { genId, pickPalette } from "./store-util";

/**
 * Backend de datos sobre Postgres (Neon). Se usa cuando hay DATABASE_URL.
 * Crea las tablas y siembra los datos iniciales automáticamente la primera vez.
 */

type Row = Record<string, unknown>;

let _sql: ReturnType<typeof neon> | null = null;
function db(): ReturnType<typeof neon> {
  if (!_sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL no configurada");
    _sql = neon(url);
  }
  return _sql;
}

// --- Migración + seed (idempotente) ---

let ready: Promise<void> | null = null;
function ensureReady(): Promise<void> {
  if (!ready) ready = migrate();
  return ready;
}

async function migrate(): Promise<void> {
  const sql = db();
  await sql`CREATE TABLE IF NOT EXISTS screenings (
    id text PRIMARY KEY,
    title text NOT NULL,
    year int,
    genre text,
    duration int,
    rating text,
    synopsis text,
    poster text NOT NULL,
    image_url text,
    pending_vote boolean NOT NULL DEFAULT false,
    date text NOT NULL,
    time text NOT NULL,
    location text
  )`;
  // Para BDs ya creadas sin la columna:
  await sql`ALTER TABLE screenings ADD COLUMN IF NOT EXISTS pending_vote boolean NOT NULL DEFAULT false`;
  await sql`CREATE TABLE IF NOT EXISTS candidates (
    id text PRIMARY KEY,
    title text NOT NULL,
    year int,
    genre text,
    synopsis text,
    poster text NOT NULL,
    image_url text,
    proposed_by text,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS votes (
    candidate_id text NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    device_id text NOT NULL,
    PRIMARY KEY (candidate_id, device_id)
  )`;
  const counts = (await sql`SELECT
      (SELECT COUNT(*) FROM screenings)::int AS s,
      (SELECT COUNT(*) FROM candidates)::int AS c`) as Row[];
  if (counts[0].s === 0 && counts[0].c === 0) await seedDb();
}

async function seedDb(): Promise<void> {
  const sql = db();
  for (const s of seed.screenings) {
    await sql`INSERT INTO screenings
      (id,title,year,genre,duration,rating,synopsis,poster,image_url,date,time,location)
      VALUES (${s.id},${s.title},${s.year},${s.genre},${s.duration},${s.rating},
        ${s.synopsis},${JSON.stringify(s.poster)},${s.imageUrl ?? null},
        ${s.date},${s.time},${s.location})
      ON CONFLICT (id) DO NOTHING`;
  }
  for (const c of seed.candidates) {
    await sql`INSERT INTO candidates
      (id,title,year,genre,synopsis,poster,image_url,proposed_by,status,created_at)
      VALUES (${c.id},${c.title},${c.year ?? null},${c.genre},${c.synopsis},
        ${JSON.stringify(c.poster)},${c.imageUrl ?? null},${c.proposedBy ?? null},
        ${c.status},${c.createdAt})
      ON CONFLICT (id) DO NOTHING`;
  }
  for (const [candidateId, devices] of Object.entries(seed.votes)) {
    for (const d of devices) {
      await sql`INSERT INTO votes (candidate_id, device_id)
        VALUES (${candidateId},${d}) ON CONFLICT DO NOTHING`;
    }
  }
}

// --- Mapeo fila -> dominio ---

function rowToScreening(r: Row): Screening {
  return {
    id: r.id as string,
    title: r.title as string,
    year: r.year as number,
    genre: r.genre as string,
    duration: r.duration as number,
    rating: r.rating as string,
    synopsis: r.synopsis as string,
    poster: JSON.parse(r.poster as string) as Poster,
    imageUrl: (r.image_url as string | null) ?? undefined,
    pendingVote: (r.pending_vote as boolean | null) ?? false,
    date: r.date as string,
    time: r.time as string,
    location: r.location as string,
  };
}

function rowToCandidateView(r: Row): CandidateView {
  const createdAt = r.created_at;
  return {
    id: r.id as string,
    title: r.title as string,
    year: (r.year as number | null) ?? undefined,
    genre: r.genre as string,
    synopsis: r.synopsis as string,
    poster: JSON.parse(r.poster as string) as Poster,
    imageUrl: (r.image_url as string | null) ?? undefined,
    proposedBy: (r.proposed_by as string | null) ?? undefined,
    status: r.status as CandidateStatus,
    createdAt:
      createdAt instanceof Date
        ? createdAt.toISOString()
        : String(createdAt ?? ""),
    votes: (r.votes as number | null) ?? 0,
    hasVoted: (r.has_voted as boolean | null) ?? false,
  };
}

// --- Cartelera ---

export async function getScreenings(): Promise<Screening[]> {
  await ensureReady();
  const rows = (await db()`
    SELECT * FROM screenings ORDER BY date ASC, time ASC`) as Row[];
  return rows.map(rowToScreening);
}

export async function addScreening(input: ScreeningInput): Promise<Screening> {
  await ensureReady();
  const sql = db();
  const id = genId("scr", input.title);
  const poster: Poster = { emoji: "🎬", ...pickPalette() };
  const rows = (await sql`INSERT INTO screenings
    (id,title,year,genre,duration,rating,synopsis,poster,image_url,pending_vote,date,time,location)
    VALUES (${id},${input.title},${input.year},${input.genre},${input.duration},
      ${input.rating},${input.synopsis},${JSON.stringify(poster)},
      ${input.imageUrl ?? null},${input.pendingVote ?? false},
      ${input.date},${input.time},${input.location})
    RETURNING *`) as Row[];
  return rowToScreening(rows[0]);
}

export async function updateScreening(
  id: string,
  patch: Partial<ScreeningInput>
): Promise<Screening | null> {
  await ensureReady();
  const sql = db();
  const cur = (await sql`SELECT * FROM screenings WHERE id=${id}`) as Row[];
  if (cur.length === 0) return null;
  const s = { ...rowToScreening(cur[0]), ...patch };
  const rows = (await sql`UPDATE screenings SET
      title=${s.title}, year=${s.year}, genre=${s.genre}, duration=${s.duration},
      rating=${s.rating}, synopsis=${s.synopsis}, image_url=${s.imageUrl ?? null},
      pending_vote=${s.pendingVote ?? false},
      date=${s.date}, time=${s.time}, location=${s.location}
    WHERE id=${id} RETURNING *`) as Row[];
  return rowToScreening(rows[0]);
}

export async function deleteScreening(id: string): Promise<boolean> {
  await ensureReady();
  const rows = (await db()`DELETE FROM screenings WHERE id=${id}
    RETURNING id`) as Row[];
  return rows.length > 0;
}

// --- Candidatas ---

export async function getCandidates(
  deviceId?: string
): Promise<CandidateView[]> {
  await ensureReady();
  const rows = (await db()`
    SELECT c.*,
      COUNT(v.device_id)::int AS votes,
      COALESCE(BOOL_OR(v.device_id = ${deviceId ?? null}), false) AS has_voted
    FROM candidates c
    LEFT JOIN votes v ON v.candidate_id = c.id
    WHERE c.status = 'approved'
    GROUP BY c.id
    ORDER BY votes DESC, c.title ASC`) as Row[];
  return rows.map(rowToCandidateView);
}

export async function getAllCandidates(): Promise<CandidateView[]> {
  await ensureReady();
  const rows = (await db()`
    SELECT c.*, COUNT(v.device_id)::int AS votes, false AS has_voted
    FROM candidates c
    LEFT JOIN votes v ON v.candidate_id = c.id
    GROUP BY c.id
    ORDER BY (c.status = 'approved') ASC, votes DESC, c.title ASC`) as Row[];
  return rows.map(rowToCandidateView);
}

export async function addCandidate(
  input: NewCandidateInput,
  createdAt: string,
  status: CandidateStatus = "pending"
): Promise<CandidateView> {
  await ensureReady();
  const sql = db();
  const id = genId(status === "approved" ? "adm" : "usr", input.title);
  const poster: Poster = { emoji: "🎬", ...pickPalette() };
  const rows = (await sql`INSERT INTO candidates
    (id,title,year,genre,synopsis,poster,image_url,proposed_by,status,created_at)
    VALUES (${id},${input.title.trim()},${input.year ?? null},
      ${input.genre.trim() || "Sin categoría"},${input.synopsis.trim()},
      ${JSON.stringify(poster)},${input.imageUrl ?? null},
      ${input.proposedBy?.trim() || null},${status},${createdAt})
    RETURNING *`) as Row[];
  return rowToCandidateView(rows[0]);
}

export async function approveCandidate(
  id: string
): Promise<CandidateView | null> {
  await ensureReady();
  const sql = db();
  const rows = (await sql`UPDATE candidates SET status='approved'
    WHERE id=${id} RETURNING *`) as Row[];
  if (rows.length === 0) return null;
  const votes = await countVotes(id);
  return { ...rowToCandidateView(rows[0]), votes };
}

export async function updateCandidate(
  id: string,
  patch: CandidatePatch
): Promise<CandidateView | null> {
  await ensureReady();
  const sql = db();
  const cur = (await sql`SELECT * FROM candidates WHERE id=${id}`) as Row[];
  if (cur.length === 0) return null;
  const c = { ...rowToCandidateView(cur[0]), ...patch };
  const rows = (await sql`UPDATE candidates SET
      title=${c.title}, year=${c.year ?? null}, genre=${c.genre},
      synopsis=${c.synopsis}, image_url=${c.imageUrl ?? null}
    WHERE id=${id} RETURNING *`) as Row[];
  const votes = await countVotes(id);
  return { ...rowToCandidateView(rows[0]), votes };
}

export async function deleteCandidate(id: string): Promise<boolean> {
  await ensureReady();
  const rows = (await db()`DELETE FROM candidates WHERE id=${id}
    RETURNING id`) as Row[];
  return rows.length > 0;
}

async function countVotes(candidateId: string): Promise<number> {
  const rows = (await db()`SELECT COUNT(*)::int AS n FROM votes
    WHERE candidate_id=${candidateId}`) as Row[];
  return (rows[0].n as number) ?? 0;
}

export async function toggleVote(
  candidateId: string,
  deviceId: string
): Promise<VoteResult | null> {
  await ensureReady();
  const sql = db();
  const c = (await sql`SELECT status FROM candidates
    WHERE id=${candidateId}`) as Row[];
  if (c.length === 0 || c[0].status !== "approved") return null;

  const del = (await sql`DELETE FROM votes
    WHERE candidate_id=${candidateId} AND device_id=${deviceId}
    RETURNING device_id`) as Row[];
  let hasVoted: boolean;
  if (del.length > 0) {
    hasVoted = false;
  } else {
    await sql`INSERT INTO votes (candidate_id, device_id)
      VALUES (${candidateId},${deviceId}) ON CONFLICT DO NOTHING`;
    hasVoted = true;
  }
  const votes = await countVotes(candidateId);
  return { id: candidateId, votes, hasVoted };
}
