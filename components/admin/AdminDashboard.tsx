"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { CandidateView, Screening } from "@/lib/types";
import { Poster } from "@/components/Poster";
import { formatDateLong } from "@/lib/format";
import { ScreeningForm } from "./ScreeningForm";
import { CandidateForm } from "./CandidateForm";

type Tab = "cartelera" | "propuestas";

const sortScreenings = (list: Screening[]) =>
  [...list].sort((a, b) =>
    `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
  );

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("cartelera");
  const [screenings, setScreenings] = useState<Screening[] | null>(null);
  const [candidates, setCandidates] = useState<CandidateView[] | null>(null);

  const [addingScreening, setAddingScreening] = useState(false);
  const [editingScreening, setEditingScreening] = useState<Screening | null>(
    null
  );
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<CandidateView | null>(
    null
  );
  const [busy, setBusy] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin/screenings")
      .then((r) => r.json())
      .then((d) => setScreenings(sortScreenings(d.screenings ?? [])));
    fetch("/api/admin/candidates")
      .then((r) => r.json())
      .then((d) => setCandidates(d.candidates ?? []));
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const withBusy = async (id: string, fn: () => Promise<void>) => {
    setBusy((b) => new Set(b).add(id));
    try {
      await fn();
    } finally {
      setBusy((b) => {
        const n = new Set(b);
        n.delete(id);
        return n;
      });
    }
  };

  // --- Screenings ---
  function onScreeningSaved(s: Screening) {
    setScreenings((prev) => {
      const base = prev ?? [];
      const exists = base.some((x) => x.id === s.id);
      return sortScreenings(
        exists ? base.map((x) => (x.id === s.id ? s : x)) : [...base, s]
      );
    });
    setAddingScreening(false);
    setEditingScreening(null);
  }

  function deleteScreening(s: Screening) {
    if (!confirm(`¿Eliminar la sesión de “${s.title}”?`)) return;
    withBusy(s.id, async () => {
      const res = await fetch(`/api/admin/screenings/${s.id}`, {
        method: "DELETE",
      });
      if (res.ok)
        setScreenings((prev) => (prev ?? []).filter((x) => x.id !== s.id));
    });
  }

  // --- Candidates ---
  function onCandidateSaved(c: CandidateView) {
    setCandidates((prev) => {
      const base = prev ?? [];
      const exists = base.some((x) => x.id === c.id);
      return exists ? base.map((x) => (x.id === c.id ? c : x)) : [...base, c];
    });
    setAddingCandidate(false);
    setEditingCandidate(null);
  }

  function approve(c: CandidateView) {
    withBusy(c.id, async () => {
      const res = await fetch(`/api/admin/candidates/${c.id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        const d = await res.json();
        setCandidates((prev) =>
          (prev ?? []).map((x) => (x.id === c.id ? d.candidate : x))
        );
      }
    });
  }

  function removeCandidate(c: CandidateView, isProposal: boolean) {
    const msg = isProposal
      ? `¿Rechazar la propuesta “${c.title}”?`
      : `¿Eliminar “${c.title}” de las votaciones?`;
    if (!confirm(msg)) return;
    withBusy(c.id, async () => {
      const res = await fetch(`/api/admin/candidates/${c.id}`, {
        method: "DELETE",
      });
      if (res.ok)
        setCandidates((prev) => (prev ?? []).filter((x) => x.id !== c.id));
    });
  }

  const pending = (candidates ?? []).filter((c) => c.status === "pending");
  const approved = (candidates ?? []).filter((c) => c.status === "approved");

  return (
    <div>
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/UNIO_LOGOTIPO_AZUL.png"
            alt="ÜNIO"
            width={100}
            height={47}
            className="h-6 w-auto"
          />
          <span className="brand-heading text-sm text-indigo">Panel</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold">
          <Link href="/" className="text-muted hover:text-indigo">
            Ver web ↗
          </Link>
          <button
            onClick={logout}
            className="rounded-lg border border-line px-3 py-1.5 text-ink hover:border-coral hover:text-coral"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-line bg-cream p-1">
        <TabButton active={tab === "cartelera"} onClick={() => setTab("cartelera")}>
          Cartelera {screenings ? `(${screenings.length})` : ""}
        </TabButton>
        <TabButton
          active={tab === "propuestas"}
          onClick={() => setTab("propuestas")}
        >
          Propuestas {pending.length > 0 ? `(${pending.length})` : ""}
        </TabButton>
      </div>

      {/* CARTELERA */}
      {tab === "cartelera" && (
        <div className="space-y-4">
          {!addingScreening && !editingScreening && (
            <button
              onClick={() => setAddingScreening(true)}
              className="w-full rounded-xl border border-dashed border-indigo/40 bg-indigo/[0.04] py-3 text-sm font-bold text-indigo hover:bg-indigo/10"
            >
              + Añadir sesión
            </button>
          )}

          {(addingScreening || editingScreening) && (
            <ScreeningForm
              initial={editingScreening ?? undefined}
              onSaved={onScreeningSaved}
              onCancel={() => {
                setAddingScreening(false);
                setEditingScreening(null);
              }}
            />
          )}

          {screenings === null ? (
            <SkeletonList />
          ) : screenings.length === 0 ? (
            <Empty>No hay sesiones programadas.</Empty>
          ) : (
            <ul className="space-y-2.5">
              {screenings.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-card p-2.5 shadow-sm"
                >
                  <Poster
                    poster={s.poster}
                    imageUrl={s.imageUrl}
                    title={s.title}
                    className="h-16 w-12"
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-ink">{s.title}</p>
                    <p className="text-xs text-muted">
                      {formatDateLong(s.date)} · {s.time} h
                    </p>
                    <p className="truncate text-xs text-muted">{s.genre}</p>
                  </div>
                  <RowActions
                    onEdit={() => {
                      setAddingScreening(false);
                      setEditingScreening(s);
                    }}
                    onDelete={() => deleteScreening(s)}
                    busy={busy.has(s.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* PROPUESTAS */}
      {tab === "propuestas" && (
        <div className="space-y-6">
          {/* Pendientes */}
          <section className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
              Pendientes de aprobar
            </h2>
            {candidates === null ? (
              <SkeletonList />
            ) : pending.length === 0 ? (
              <Empty>No hay propuestas pendientes. 🎉</Empty>
            ) : (
              <ul className="space-y-2.5">
                {pending.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-xl border border-tan/40 bg-tan/[0.06] p-3 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <Poster
                        poster={c.poster}
                        imageUrl={c.imageUrl}
                        title={c.title}
                        className="h-16 w-12"
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-ink">{c.title}</p>
                        <p className="text-xs text-muted">
                          {c.genre}
                          {c.year ? ` · ${c.year}` : ""}
                          {c.proposedBy ? ` · por ${c.proposedBy}` : ""}
                        </p>
                        {c.synopsis && (
                          <p className="mt-1 line-clamp-2 text-xs text-ink-soft">
                            {c.synopsis}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <button
                        onClick={() => approve(c)}
                        disabled={busy.has(c.id)}
                        className="rounded-lg bg-indigo px-3 py-1.5 text-xs font-bold text-white active:scale-95 disabled:opacity-50"
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        onClick={() => setEditingCandidate(c)}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => removeCandidate(c, true)}
                        disabled={busy.has(c.id)}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:border-coral hover:text-coral disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* En votación */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                En votación
              </h2>
              {!addingCandidate && !editingCandidate && (
                <button
                  onClick={() => setAddingCandidate(true)}
                  className="text-xs font-bold text-indigo hover:underline"
                >
                  + Añadir
                </button>
              )}
            </div>

            {(addingCandidate || editingCandidate) && (
              <CandidateForm
                initial={editingCandidate ?? undefined}
                onSaved={onCandidateSaved}
                onCancel={() => {
                  setAddingCandidate(false);
                  setEditingCandidate(null);
                }}
              />
            )}

            {candidates === null ? (
              <SkeletonList />
            ) : approved.length === 0 ? (
              <Empty>No hay películas en votación.</Empty>
            ) : (
              <ul className="space-y-2.5">
                {approved
                  .sort((a, b) => b.votes - a.votes)
                  .map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center gap-3 rounded-xl border border-line bg-card p-2.5 shadow-sm"
                    >
                      <Poster
                        poster={c.poster}
                        imageUrl={c.imageUrl}
                        title={c.title}
                        className="h-16 w-12"
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-ink">{c.title}</p>
                        <p className="text-xs text-muted">
                          {c.genre}
                          {c.year ? ` · ${c.year}` : ""}
                        </p>
                        <p className="text-xs font-semibold text-indigo">
                          {c.votes} {c.votes === 1 ? "voto" : "votos"}
                        </p>
                      </div>
                      <RowActions
                        onEdit={() => {
                          setAddingCandidate(false);
                          setEditingCandidate(c);
                        }}
                        onDelete={() => removeCandidate(c, false)}
                        busy={busy.has(c.id)}
                      />
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
        active ? "bg-card text-indigo shadow-sm" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function RowActions({
  onEdit,
  onDelete,
  busy,
}: {
  onEdit: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col gap-1.5">
      <button
        onClick={onEdit}
        className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-ink hover:border-indigo hover:text-indigo"
      >
        Editar
      </button>
      <button
        onClick={onDelete}
        disabled={busy}
        className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-muted hover:border-coral hover:text-coral disabled:opacity-50"
      >
        Eliminar
      </button>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-cream" />
      ))}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-line bg-card p-6 text-center text-sm text-muted">
      {children}
    </p>
  );
}
