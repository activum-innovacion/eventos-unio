import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { getSurveyResponses } from "@/lib/store";
import { summarize, Q2_LABELS, type Tally } from "@/lib/survey";
import { ExportCsvButton } from "@/components/survey/ExportCsvButton";

export const dynamic = "force-dynamic";

export default async function RespuestasPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const responses = await getSurveyResponses();
  const s = summarize(responses);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="brand-heading text-2xl text-ink">Respuestas</h1>
          <p className="mt-1 text-sm text-muted">
            Encuesta de valoración · {s.total}{" "}
            {s.total === 1 ? "respuesta" : "respuestas"}
          </p>
        </div>
        <ExportCsvButton responses={responses} />
      </header>

      {s.total === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-8 text-center">
          <p className="text-sm text-muted">
            Todavía no hay respuestas. Comparte el enlace{" "}
            <span className="font-semibold text-ink">/encuestas</span> con los
            residentes.
          </p>
        </div>
      ) : (
        <>
          <Block n={1} title="¿A cuántas sesiones has asistido?">
            <TallyBars tallies={s.q1} total={s.total} />
          </Block>

          <Block n={2} title="Valoración general de la experiencia">
            <div className="mb-4 flex items-end gap-3">
              <span className="text-4xl font-extrabold leading-none text-indigo">
                {s.q2.average !== null ? s.q2.average.toFixed(1) : "—"}
              </span>
              <span className="mb-0.5 text-sm text-muted">
                / 5{" "}
                {s.q2.answered > 0 &&
                  `· media de ${s.q2.answered} ${
                    s.q2.answered === 1 ? "voto" : "votos"
                  }`}
              </span>
            </div>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((n) => (
                <BarRow
                  key={n}
                  label={`${n} · ${Q2_LABELS[n]}`}
                  count={s.q2.counts[n - 1]}
                  total={s.q2.answered || 1}
                  tone="amber"
                />
              ))}
            </div>
            {s.q2.naCount > 0 && (
              <p className="mt-3 text-xs text-muted">
                {s.q2.naCount}{" "}
                {s.q2.naCount === 1
                  ? "persona indicó que no ha asistido"
                  : "personas indicaron que no han asistido"}
                .
              </p>
            )}
          </Block>

          <Block n={3} title="¿Qué te ha parecido la selección de películas?">
            <TallyBars tallies={s.q3} total={s.total} />
          </Block>

          <Block n={4} title="Aspectos a mejorar">
            <p className="mb-2 text-xs text-muted">
              Selección múltiple · % sobre el total de respuestas.
            </p>
            <TallyBars tallies={s.q4} total={s.total} />
          </Block>

          <Block n={5} title="Ideas para otoño e invierno">
            {s.q5.length === 0 ? (
              <p className="text-sm text-muted">
                Sin respuestas de texto libre.
              </p>
            ) : (
              <ul className="space-y-2">
                {s.q5.map((item, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-line bg-cream/60 p-3"
                  >
                    <p className="text-sm leading-relaxed text-ink-soft">
                      “{item.text}”
                    </p>
                    <p className="mt-1 text-[0.68rem] text-muted">
                      {new Date(item.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Block>
        </>
      )}

      <Link
        href="/admin"
        className="block pt-2 text-center text-xs font-medium text-muted hover:text-indigo"
      >
        ← Panel de administración
      </Link>
    </div>
  );
}

function Block({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo/10 text-xs font-bold text-indigo">
          {n}
        </span>
        <h2 className="text-sm font-bold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function TallyBars({ tallies, total }: { tallies: Tally[]; total: number }) {
  return (
    <div className="space-y-1.5">
      {tallies.map((t) => (
        <BarRow key={t.value} label={t.label} count={t.count} total={total} />
      ))}
    </div>
  );
}

function BarRow({
  label,
  count,
  total,
  tone = "indigo",
}: {
  label: string;
  count: number;
  total: number;
  tone?: "indigo" | "amber";
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const barColor = tone === "amber" ? "bg-amber" : "bg-indigo";
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-40 shrink-0 truncate text-xs text-ink-soft">
        {label}
      </span>
      <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-cream">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-14 shrink-0 text-right text-xs font-semibold tabular-nums text-ink">
        {count} · {pct}%
      </span>
    </div>
  );
}
