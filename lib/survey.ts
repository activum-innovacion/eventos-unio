/**
 * Definición de la encuesta de valoración de actividades de ÜNIO.
 * Se comparte entre el formulario público (/encuestas), la validación de la
 * API y la vista de resultados (/respuestas), para que las etiquetas y los
 * valores canónicos vivan en un único sitio.
 */

export type Option = { value: string; label: string };

// 1. ¿A cuántas sesiones del cine de verano has asistido?
export const Q1_OPTIONS: readonly Option[] = [
  { value: "ninguna", label: "Ninguna" },
  { value: "1-2", label: "1 o 2" },
  { value: "3-4", label: "3 o 4" },
  { value: "5-mas", label: "5 o más" },
];

// 2. Valoración general (1-5). El texto de los extremos:
export const Q2_LABELS: Record<number, string> = {
  1: "Muy mala",
  2: "Mala",
  3: "Normal",
  4: "Buena",
  5: "Muy buena",
};

// 3. ¿Qué te ha parecido la selección de películas?
export const Q3_OPTIONS: readonly Option[] = [
  { value: "mucho", label: "Me ha gustado mucho" },
  { value: "bastante", label: "Me ha gustado bastante" },
  { value: "poco", label: "Me ha gustado poco" },
  { value: "nada", label: "No me ha gustado" },
  { value: "no-vista", label: "No he visto la programación" },
];

// 4. ¿Qué aspectos podríamos mejorar? (varias opciones)
export const Q4_OPTIONS: readonly Option[] = [
  { value: "variedad", label: "La variedad de películas" },
  { value: "dia-horario", label: "El día o el horario" },
  { value: "espacio", label: "La comodidad del espacio" },
  { value: "imagen-sonido", label: "La calidad de imagen o sonido" },
  { value: "informacion", label: "La información sobre las sesiones" },
  { value: "todo-bien", label: "Todo me ha parecido bien" },
  { value: "no-asistido", label: "No he asistido" },
];

/** Opciones de Q4 que son "excluyentes": elegirlas vacía las demás y viceversa. */
export const Q4_EXCLUSIVE = new Set(["todo-bien", "no-asistido"]);

export const Q5_MAX = 1000;

export function labelFor(options: readonly Option[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

// --- Tipos de dominio ---

export type SurveyInput = {
  q1: string; // uno de Q1_OPTIONS
  q2: number | null; // 1..5, o null = "No he asistido"
  q3: string; // uno de Q3_OPTIONS
  q4: string[]; // subconjunto de Q4_OPTIONS
  q5: string; // texto libre (puede ser "")
  deviceId?: string;
};

export type SurveyResponse = SurveyInput & {
  id: string;
  createdAt: string; // ISO
};

// --- Validación (servidor) ---

const Q1_VALUES = new Set(Q1_OPTIONS.map((o) => o.value));
const Q3_VALUES = new Set(Q3_OPTIONS.map((o) => o.value));
const Q4_VALUES = new Set(Q4_OPTIONS.map((o) => o.value));

/**
 * Valida y normaliza el cuerpo recibido en la API. Devuelve null si no cumple.
 * Reglas: q1 y q3 obligatorios (valor válido); q2 = entero 1..5 o null;
 * q4 = subconjunto (puede ir vacío); q5 opcional (se recorta).
 */
export function parseSurveyInput(body: unknown): SurveyInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  if (typeof b.q1 !== "string" || !Q1_VALUES.has(b.q1)) return null;
  if (typeof b.q3 !== "string" || !Q3_VALUES.has(b.q3)) return null;

  let q2: number | null;
  if (b.q2 === null || b.q2 === undefined) {
    q2 = null;
  } else if (
    typeof b.q2 === "number" &&
    Number.isInteger(b.q2) &&
    b.q2 >= 1 &&
    b.q2 <= 5
  ) {
    q2 = b.q2;
  } else {
    return null;
  }

  const rawQ4 = Array.isArray(b.q4) ? b.q4 : [];
  const q4 = [...new Set(rawQ4)].filter(
    (v): v is string => typeof v === "string" && Q4_VALUES.has(v)
  );

  const q5 =
    typeof b.q5 === "string" ? b.q5.trim().slice(0, Q5_MAX) : "";

  const deviceId =
    typeof b.deviceId === "string" ? b.deviceId.slice(0, 100) : undefined;

  return { q1: b.q1, q2, q3: b.q3, q4, q5, deviceId };
}

// --- Agregación (vista de resultados) ---

export type Tally = { value: string; label: string; count: number };

export type SurveySummary = {
  total: number;
  q1: Tally[];
  q2: {
    average: number | null;
    /** counts[i] = nº de respuestas con nota (i+1), i de 0..4 */
    counts: number[];
    answered: number;
    naCount: number;
  };
  q3: Tally[];
  q4: Tally[];
  q5: { text: string; createdAt: string }[];
};

function tally(options: readonly Option[], values: string[]): Tally[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return options.map((o) => ({
    value: o.value,
    label: o.label,
    count: counts.get(o.value) ?? 0,
  }));
}

export function summarize(responses: SurveyResponse[]): SurveySummary {
  const q2counts = [0, 0, 0, 0, 0];
  let q2sum = 0;
  let q2answered = 0;
  let q2na = 0;

  for (const r of responses) {
    if (r.q2 === null) {
      q2na++;
    } else if (r.q2 >= 1 && r.q2 <= 5) {
      q2counts[r.q2 - 1]++;
      q2sum += r.q2;
      q2answered++;
    }
  }

  const q5 = responses
    .filter((r) => r.q5 && r.q5.trim().length > 0)
    .map((r) => ({ text: r.q5, createdAt: r.createdAt }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    total: responses.length,
    q1: tally(Q1_OPTIONS, responses.map((r) => r.q1)),
    q2: {
      average: q2answered ? q2sum / q2answered : null,
      counts: q2counts,
      answered: q2answered,
      naCount: q2na,
    },
    q3: tally(Q3_OPTIONS, responses.map((r) => r.q3)),
    q4: tally(Q4_OPTIONS, responses.flatMap((r) => r.q4)),
    q5,
  };
}
