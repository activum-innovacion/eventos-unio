"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CandidateView } from "@/lib/types";
import { CandidateCard } from "@/components/CandidateCard";
import { TrophyIcon } from "@/components/icons";
import { getDeviceId } from "@/lib/deviceId";
import { useScreenings } from "@/lib/useScreenings";
import { votingStatus } from "@/lib/voting";
import { formatDateLong } from "@/lib/format";
import { useLang } from "@/lib/i18n";

type VoteResp = { id: string; votes: number; hasVoted: boolean };

export default function VotacionesPage() {
  const { lang, t } = useLang();
  const [candidates, setCandidates] = useState<CandidateView[] | null>(null);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState<Set<string>>(new Set());
  const deviceId = useRef<string>("");

  const { screenings, now } = useScreenings();
  const status = useMemo(
    () => (screenings ? votingStatus(screenings, now) : null),
    [screenings, now]
  );
  const votingClosed = status ? !status.open : false;

  useEffect(() => {
    deviceId.current = getDeviceId();
    let alive = true;
    fetch(`/api/candidates?deviceId=${encodeURIComponent(deviceId.current)}`)
      .then((r) => r.json())
      .then((d) => alive && setCandidates(d.candidates ?? []))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  async function handleVote(id: string) {
    if (pending.has(id) || votingClosed) return;
    setCandidates((prev) =>
      prev
        ? prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  hasVoted: !c.hasVoted,
                  votes: c.votes + (c.hasVoted ? -1 : 1),
                }
              : c
          )
        : prev
    );
    setPending((p) => new Set(p).add(id));

    try {
      const res = await fetch(
        `/api/candidates/${encodeURIComponent(id)}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId: deviceId.current }),
        }
      );
      if (!res.ok) throw new Error();
      const data: VoteResp = await res.json();
      setCandidates((prev) =>
        prev
          ? prev.map((c) =>
              c.id === id
                ? { ...c, votes: data.votes, hasVoted: data.hasVoted }
                : c
            )
          : prev
      );
    } catch {
      setCandidates((prev) =>
        prev
          ? prev.map((c) =>
              c.id === id
                ? {
                    ...c,
                    hasVoted: !c.hasVoted,
                    votes: c.votes + (c.hasVoted ? -1 : 1),
                  }
                : c
            )
          : prev
      );
    } finally {
      setPending((p) => {
        const n = new Set(p);
        n.delete(id);
        return n;
      });
    }
  }

  const totalVotes = candidates?.reduce((sum, c) => sum + c.votes, 0) ?? 0;
  const myVotes = candidates?.filter((c) => c.hasVoted).length ?? 0;

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-5 w-5 text-indigo" />
          <h1 className="brand-heading text-2xl text-ink">{t.votingTitle}</h1>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {t.votingIntro}
        </p>
      </section>

      {status?.hasPending &&
        (status.open ? (
          <div className="rounded-xl border border-indigo/25 bg-indigo/[0.06] p-3.5 text-sm leading-relaxed text-ink-soft">
            🗳️ {t.voteUntil}{" "}
            <span className="font-bold text-indigo">
              {formatDateLong(status.closeDate!, lang)}
            </span>
            . {t.thenClosesFor}{" "}
            <span className="font-semibold text-ink">
              {formatDateLong(status.sessionDate!, lang)}
            </span>
            .
          </div>
        ) : (
          <div className="rounded-xl border border-line bg-cream p-3.5 text-sm leading-relaxed text-ink-soft">
            🔒 {t.votingClosedFor}{" "}
            <span className="font-semibold text-ink">
              {formatDateLong(status.sessionDate!, lang)}
            </span>
            . {t.decidedWithVotes}
          </div>
        ))}

      {candidates && (
        <div className="flex gap-2.5 text-center">
          <Stat value={totalVotes} label={t.totalVotes} />
          <Stat value={candidates.length} label={t.candidatesLabel} />
          <Stat value={myVotes} label={t.yourVotes} accent />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-coral/30 bg-coral/10 p-4 text-sm text-coral">
          {t.errorVotes}
        </div>
      )}

      {!candidates && !error && <VoteSkeleton />}

      {candidates && candidates.length === 0 && (
        <p className="rounded-xl border border-line bg-card p-6 text-center text-sm text-muted">
          {t.noMovies}
        </p>
      )}

      {candidates && candidates.length > 0 && (
        <div className="space-y-2.5">
          {candidates.map((c, i) => (
            <div
              key={c.id}
              className="animate-in"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <CandidateCard
                candidate={c}
                rank={i + 1}
                pending={pending.has(c.id)}
                votingClosed={votingClosed}
                onVote={handleVote}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex-1 rounded-xl border px-2 py-2.5 ${
        accent ? "border-indigo/30 bg-indigo/[0.06]" : "border-line bg-card"
      }`}
    >
      <div
        className={`text-xl font-extrabold tabular-nums ${
          accent ? "text-indigo" : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="text-[0.65rem] uppercase tracking-wide text-muted">
        {label}
      </div>
    </div>
  );
}

function VoteSkeleton() {
  return (
    <div className="space-y-2.5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-cream" />
      ))}
    </div>
  );
}
