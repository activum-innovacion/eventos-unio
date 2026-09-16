"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getDeviceId } from "@/lib/deviceId";
import {
  Q1_OPTIONS,
  Q2_LABELS,
  Q3_OPTIONS,
  Q4_OPTIONS,
  Q4_EXCLUSIVE,
  Q5_MAX,
  type Option,
} from "@/lib/survey";

const DONE_KEY = "cine-unio-encuesta-done";
type Q2 = number | "na" | null;

export default function EncuestasPage() {
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<Q2>(null);
  const [q3, setQ3] = useState<string | null>(null);
  const [q4, setQ4] = useState<string[]>([]);
  const [q5, setQ5] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const deviceId = useRef("");

  useEffect(() => {
    deviceId.current = getDeviceId();
    try {
      if (window.localStorage.getItem(DONE_KEY) === "1") setDone(true);
    } catch {
      /* ignore */
    }
  }, []);

  function toggleQ4(value: string) {
    setQ4((prev) => {
      const has = prev.includes(value);
      if (has) return prev.filter((v) => v !== value);
      // Exclusividad: "Todo bien" / "No he asistido" vacían el resto y viceversa.
      if (Q4_EXCLUSIVE.has(value)) return [value];
      return [...prev.filter((v) => !Q4_EXCLUSIVE.has(v)), value];
    });
  }

  const canSubmit = useMemo(
    () => !!q1 && q2 !== null && !!q3 && q4.length > 0 && !submitting,
    [q1, q2, q3, q4, submitting]
  );

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/encuestas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q1,
          q2: q2 === "na" ? null : q2,
          q3,
          q4,
          q5,
          deviceId: deviceId.current,
        }),
      });
      if (!res.ok) throw new Error();
      try {
        window.localStorage.setItem(DONE_KEY, "1");
      } catch {
        /* ignore */
      }
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("No se pudo enviar la encuesta. Inténtalo de nuevo.");
      setSubmitting(false);
    }
  }

  function resetForNew() {
    setQ1(null);
    setQ2(null);
    setQ3(null);
    setQ4([]);
    setQ5("");
    setSubmitting(false);
    setError(null);
    setDone(false);
    try {
      window.localStorage.removeItem(DONE_KEY);
    } catch {
      /* ignore */
    }
  }

  if (done) {
    return (
      <div className="animate-in flex flex-col items-center gap-4 rounded-2xl border border-indigo/25 bg-card p-8 text-center shadow-sm">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-indigo/10 text-3xl">
          🎉
        </div>
        <h1 className="brand-heading text-2xl text-ink">¡Gracias!</h1>
        <p className="text-sm leading-relaxed text-ink-soft">
          Hemos recibido tu opinión. Nos ayudará a preparar las próximas
          actividades del residencial. 🍿
        </p>
        <button
          type="button"
          onClick={resetForNew}
          className="mt-2 text-xs font-bold text-indigo hover:underline"
        >
          Enviar otra respuesta
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="animate-in">
        <h1 className="brand-heading text-2xl leading-tight text-ink">
          ¡Queremos conocer tu opinión! 🍿
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Ayúdanos a mejorar las actividades de ÜNIO. Solo te llevará un minuto.
        </p>
      </header>

      {/* 1 */}
      <Field
        n={1}
        question="¿A cuántas sesiones del cine de verano has asistido?"
      >
        <SingleChoice options={Q1_OPTIONS} value={q1} onChange={setQ1} />
      </Field>

      {/* 2 */}
      <Field
        n={2}
        question="En general, ¿cómo valorarías tu experiencia en el cine de verano?"
        hint="Del 1 (muy mala) al 5 (muy buena)."
      >
        <StarRating value={q2} onChange={setQ2} />
      </Field>

      {/* 3 */}
      <Field n={3} question="¿Qué te ha parecido la selección de películas?">
        <SingleChoice options={Q3_OPTIONS} value={q3} onChange={setQ3} />
      </Field>

      {/* 4 */}
      <Field
        n={4}
        question="¿Qué aspectos del cine de verano crees que podríamos mejorar?"
        hint="Puedes seleccionar varias opciones."
      >
        <MultiChoice options={Q4_OPTIONS} values={q4} onToggle={toggleQ4} />
      </Field>

      {/* 5 */}
      <Field
        n={5}
        question="¿Qué actividades te gustaría que organizáramos este otoño e invierno?"
        hint="¡Cuéntanos tus ideas! (opcional)"
      >
        <textarea
          value={q5}
          onChange={(e) => setQ5(e.target.value.slice(0, Q5_MAX))}
          rows={4}
          placeholder="Escribe aquí tus ideas…"
          className="w-full resize-none rounded-xl border border-line bg-card px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-indigo focus:ring-2 focus:ring-indigo/15"
        />
        <p className="mt-1 text-right text-[0.68rem] text-muted">
          {q5.length}/{Q5_MAX}
        </p>
      </Field>

      {error && (
        <div className="rounded-xl border border-coral/30 bg-coral/10 p-3.5 text-sm text-coral">
          {error}
        </div>
      )}

      <div className="pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-xl bg-indigo py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-indigo/20 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {submitting ? "Enviando…" : "Enviar respuesta"}
        </button>
        {!canSubmit && !submitting && (
          <p className="mt-2 text-center text-[0.68rem] text-muted">
            Responde las preguntas 1 a 4 para enviar.
          </p>
        )}
      </div>

      <p className="pb-4 text-center text-xs text-muted">
        ¡Gracias por ayudarnos a preparar los próximos planes!
      </p>
    </div>
  );
}

// --- Subcomponentes ---

function Field({
  n,
  question,
  hint,
  children,
}: {
  n: number;
  question: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="animate-in rounded-2xl border border-line bg-card p-4 shadow-sm"
      style={{ animationDelay: `${n * 40}ms` }}
    >
      <div className="mb-3 flex gap-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo/10 text-xs font-bold text-indigo">
          {n}
        </span>
        <div>
          <h2 className="text-sm font-bold leading-snug text-ink">
            {question}
          </h2>
          {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function SingleChoice({
  options,
  value,
  onChange,
}: {
  options: readonly Option[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${
              active
                ? "border-indigo bg-indigo/[0.06] font-semibold text-ink"
                : "border-line bg-card text-ink-soft hover:border-indigo/40"
            }`}
          >
            <span
              className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
                active ? "border-indigo" : "border-line"
              }`}
            >
              {active && <span className="h-2 w-2 rounded-full bg-indigo" />}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function MultiChoice({
  options,
  values,
  onToggle,
}: {
  options: readonly Option[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => {
        const active = values.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onToggle(o.value)}
            aria-pressed={active}
            className={`flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${
              active
                ? "border-indigo bg-indigo/[0.06] font-semibold text-ink"
                : "border-line bg-card text-ink-soft hover:border-indigo/40"
            }`}
          >
            <span
              className={`grid h-4 w-4 shrink-0 place-items-center rounded-[0.3rem] border-2 ${
                active ? "border-indigo bg-indigo" : "border-line"
              }`}
            >
              {active && (
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12l5 5L20 6" />
                </svg>
              )}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: Q2;
  onChange: (v: Q2) => void;
}) {
  const rating = typeof value === "number" ? value : 0;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const on = rating >= n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-label={`${n} — ${Q2_LABELS[n]}`}
              aria-pressed={value === n}
              className="transition-transform active:scale-90"
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-9 w-9 ${on ? "text-amber" : "text-line"}`}
                fill={on ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinejoin="round"
              >
                <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.9l-5.81 3.06 1.11-6.47-4.7-4.58 6.5-.95z" />
              </svg>
            </button>
          );
        })}
        <span className="ml-1.5 text-sm font-semibold text-ink">
          {rating > 0 ? Q2_LABELS[rating] : ""}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onChange("na")}
        aria-pressed={value === "na"}
        className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm transition-colors ${
          value === "na"
            ? "border-indigo bg-indigo/[0.06] font-semibold text-ink"
            : "border-line bg-card text-ink-soft hover:border-indigo/40"
        }`}
      >
        <span
          className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
            value === "na" ? "border-indigo" : "border-line"
          }`}
        >
          {value === "na" && (
            <span className="h-2 w-2 rounded-full bg-indigo" />
          )}
        </span>
        No he asistido
      </button>
    </div>
  );
}
