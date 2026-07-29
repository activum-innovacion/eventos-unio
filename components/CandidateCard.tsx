"use client";

import { useState } from "react";
import type { CandidateView } from "@/lib/types";
import { Poster } from "./Poster";
import { HeartIcon } from "./icons";
import { useLang } from "@/lib/i18n";

export function CandidateCard({
  candidate,
  rank,
  pending,
  votingClosed,
  onVote,
}: {
  candidate: CandidateView;
  rank: number;
  pending: boolean;
  votingClosed?: boolean;
  onVote: (id: string) => void;
}) {
  const { t } = useLang();
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-2xl border border-line bg-card p-3 shadow-sm">
      <div className="flex gap-3">
        <div className="relative">
          <Poster
            poster={candidate.poster}
            imageUrl={candidate.imageUrl}
            title={candidate.title}
            className="h-[4.75rem] w-14"
            size="sm"
          />
          <span
            className="absolute -left-2 -top-2 grid h-7 min-w-7 place-items-center rounded-full bg-ink px-1 text-xs font-bold text-white shadow-sm"
            aria-label={`Puesto ${rank}`}
          >
            {rank}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-tight text-ink">
            {candidate.title}
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {candidate.genre}
            {candidate.year ? ` · ${candidate.year}` : ""}
          </p>
          {candidate.proposedBy && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-indigo/10 px-2 py-0.5 text-[0.62rem] font-semibold text-indigo-ink">
              {t.proposedBy(candidate.proposedBy)}
            </span>
          )}
          {candidate.synopsis && (
            <p
              className={`mt-1.5 text-xs leading-relaxed text-ink-soft ${
                expanded ? "" : "line-clamp-2"
              }`}
              onClick={() => setExpanded((e) => !e)}
            >
              {candidate.synopsis}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onVote(candidate.id)}
          disabled={pending || votingClosed}
          aria-pressed={candidate.hasVoted}
          aria-label={
            votingClosed
              ? t.votingClosedAria
              : candidate.hasVoted
                ? t.removeVote(candidate.title)
                : t.voteFor(candidate.title)
          }
          className={`flex w-14 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border py-2 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
            candidate.hasVoted
              ? "border-indigo bg-indigo text-white"
              : "border-line bg-card text-muted hover:border-indigo hover:text-indigo"
          }`}
        >
          <HeartIcon
            filled={candidate.hasVoted}
            className={`h-5 w-5 ${candidate.hasVoted ? "animate-pop" : ""}`}
          />
          <span
            className={`text-sm font-bold tabular-nums ${
              candidate.hasVoted ? "text-white" : "text-ink"
            }`}
          >
            {candidate.votes}
          </span>
        </button>
      </div>
    </article>
  );
}
