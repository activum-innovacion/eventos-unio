"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "./types";

type Dict = {
  appName: string;
  language: string;
  // Nav
  navHome: string;
  navSchedule: string;
  navVote: string;
  // Inicio
  calendar: string;
  seeFullSchedule: string;
  noUpcoming: string;
  errorSchedule: string;
  tapMarkedDay: string;
  close: string;
  // Hero / cartelera
  nextScreening: string;
  decidedByVote: string;
  pendingTitle: string;
  voteThisDay: string;
  pendingExpanded: string;
  daysUntilSession: (n: number) => string;
  carteleraTitle: string;
  carteleraIntro: string;
  noSessions: string;
  // Votaciones
  votingTitle: string;
  votingIntro: string;
  voteUntil: string;
  thenClosesFor: string;
  votingClosedFor: string;
  decidedWithVotes: string;
  totalVotes: string;
  candidatesLabel: string;
  yourVotes: string;
  noMovies: string;
  errorVotes: string;
  voteFor: (t: string) => string;
  removeVote: (t: string) => string;
  votingClosedAria: string;
  proposedBy: (n: string) => string;
};

const DICT: Record<Lang, Dict> = {
  es: {
    appName: "Cine de Verano",
    language: "Idioma",
    navHome: "Inicio",
    navSchedule: "Cartelera",
    navVote: "Votaciones",
    calendar: "Calendario",
    seeFullSchedule: "Ver toda la programación →",
    noUpcoming: "No hay próximas proyecciones programadas.",
    errorSchedule: "No se pudo cargar la programación.",
    tapMarkedDay: "Toca un día marcado para ver la película.",
    close: "Cerrar",
    nextScreening: "Próxima proyección",
    decidedByVote: "Se decide por votación",
    pendingTitle: "Pendiente de votación",
    voteThisDay: "🗳️ Vota la película de este día →",
    pendingExpanded:
      "La película de este día se elige por votación. Entra en Votaciones y vota tu favorita.",
    daysUntilSession: (n) =>
      `Faltan ${n} ${n === 1 ? "día" : "días"} para la sesión`,
    carteleraTitle: "Cartelera",
    carteleraIntro:
      "Toda la programación del cine de verano en la azotea. Toca una sesión para ver los detalles.",
    noSessions: "Todavía no hay sesiones programadas.",
    votingTitle: "Votaciones",
    votingIntro:
      "Vota tus películas favoritas — un voto por peli y dispositivo. La votación se cierra 3 días antes de cada sesión pendiente de votación.",
    voteUntil: "Puedes votar hasta el",
    thenClosesFor: "Después se cierra la votación para la sesión del",
    votingClosedFor: "Votación cerrada para la sesión del",
    decidedWithVotes: "La película se decide con los votos ya recibidos.",
    totalVotes: "votos totales",
    candidatesLabel: "candidatas",
    yourVotes: "tus votos",
    noMovies: "Todavía no hay películas para votar. ¡Vuelve pronto!",
    errorVotes: "No se pudieron cargar las votaciones.",
    voteFor: (t) => `Votar por ${t}`,
    removeVote: (t) => `Quitar voto de ${t}`,
    votingClosedAria: "Votación cerrada",
    proposedBy: (n) => `Propuesta por ${n}`,
  },
  en: {
    appName: "Summer Cinema",
    language: "Language",
    navHome: "Home",
    navSchedule: "Schedule",
    navVote: "Vote",
    calendar: "Calendar",
    seeFullSchedule: "See full schedule →",
    noUpcoming: "No upcoming screenings scheduled.",
    errorSchedule: "Couldn't load the schedule.",
    tapMarkedDay: "Tap a marked day to see the film.",
    close: "Close",
    nextScreening: "Next screening",
    decidedByVote: "Decided by vote",
    pendingTitle: "Pending vote",
    voteThisDay: "🗳️ Vote for this day's film →",
    pendingExpanded:
      "This day's film is chosen by vote. Go to Vote and pick your favourite.",
    daysUntilSession: (n) =>
      `${n} ${n === 1 ? "day" : "days"} until the screening`,
    carteleraTitle: "Schedule",
    carteleraIntro:
      "The full summer cinema schedule on the rooftop. Tap a session for details.",
    noSessions: "No sessions scheduled yet.",
    votingTitle: "Vote",
    votingIntro:
      "Vote for your favourite films — one vote per film and device. Voting closes 3 days before each pending screening.",
    voteUntil: "You can vote until",
    thenClosesFor: "After that, voting closes for the screening on",
    votingClosedFor: "Voting closed for the screening on",
    decidedWithVotes: "The film will be decided with the votes received.",
    totalVotes: "total votes",
    candidatesLabel: "films",
    yourVotes: "your votes",
    noMovies: "No films to vote on yet. Check back soon!",
    errorVotes: "Couldn't load the voting.",
    voteFor: (t) => `Vote for ${t}`,
    removeVote: (t) => `Remove vote from ${t}`,
    votingClosedAria: "Voting closed",
    proposedBy: (n) => `Proposed by ${n}`,
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };

const LangContext = createContext<Ctx>({
  lang: "es",
  setLang: () => {},
  t: DICT.es,
});

const STORAGE_KEY = "cine-unio-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "es") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
    } catch {
      /* ignore */
    }
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: DICT[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): Ctx {
  return useContext(LangContext);
}
