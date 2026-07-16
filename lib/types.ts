export type Poster = {
  /** Emoji shown large on the poster (placeholder cuando no hay imagen) */
  emoji: string;
  /** Two hex colors for the poster gradient (placeholder) */
  from: string;
  to: string;
};

export type Screening = {
  id: string;
  title: string;
  year: number;
  genre: string;
  /** Runtime in minutes */
  duration: number;
  /** Age classification, e.g. "TP", "+7", "+12" */
  rating: string;
  synopsis: string;
  poster: Poster;
  /** URL de la imagen/cartel de la película (subida desde el panel) */
  imageUrl?: string;
  /** Si true, el día está reservado pero la película se decide por votación */
  pendingVote?: boolean;
  /** Date in YYYY-MM-DD (local) */
  date: string;
  /** Time in HH:mm (24h) */
  time: string;
  location: string;
};

export type CandidateStatus = "approved" | "pending";

export type Candidate = {
  id: string;
  title: string;
  year?: number;
  genre: string;
  synopsis: string;
  poster: Poster;
  imageUrl?: string;
  /** Name of the resident who proposed it (undefined = curated by the committee) */
  proposedBy?: string;
  /** "pending" = propuesta por un residente, a la espera de aprobación */
  status: CandidateStatus;
  createdAt: string;
};

/** Candidate enriched with vote data for the client */
export type CandidateView = Candidate & {
  votes: number;
  hasVoted: boolean;
};

export type DB = {
  screenings: Screening[];
  candidates: Candidate[];
  /** candidateId -> list of deviceIds that voted for it */
  votes: Record<string, string[]>;
};

// --- Entradas de la capa de datos (compartidas por los backends) ---

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
  pendingVote?: boolean;
};

export type NewCandidateInput = {
  title: string;
  genre: string;
  synopsis: string;
  year?: number;
  proposedBy?: string;
  imageUrl?: string;
};

export type CandidatePatch = Partial<
  Pick<Candidate, "title" | "genre" | "synopsis" | "year" | "imageUrl">
>;

export type VoteResult = { id: string; votes: number; hasVoted: boolean };
