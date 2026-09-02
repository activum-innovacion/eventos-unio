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
  // Inicio
  calendar: string;
  seeFullSchedule: string;
  noUpcoming: string;
  errorSchedule: string;
  tapMarkedDay: string;
  close: string;
  // Hero / cartelera
  nextScreening: string;
  pendingTag: string;
  pendingTitle: string;
  pendingExpanded: string;
  daysUntilSession: (n: number) => string;
  carteleraTitle: string;
  carteleraIntro: string;
  noSessions: string;
};

const DICT: Record<Lang, Dict> = {
  es: {
    appName: "Cine de Verano",
    language: "Idioma",
    navHome: "Inicio",
    navSchedule: "Cartelera",
    calendar: "Calendario",
    seeFullSchedule: "Ver toda la programación →",
    noUpcoming: "No hay próximas proyecciones programadas.",
    errorSchedule: "No se pudo cargar la programación.",
    tapMarkedDay: "Toca un día marcado para ver la película.",
    close: "Cerrar",
    nextScreening: "Próxima proyección",
    pendingTag: "Se anunciará pronto",
    pendingTitle: "Por confirmar",
    pendingExpanded: "La película de este día se anunciará próximamente.",
    daysUntilSession: (n) =>
      `Faltan ${n} ${n === 1 ? "día" : "días"} para la sesión`,
    carteleraTitle: "Cartelera",
    carteleraIntro:
      "Toda la programación del cine de verano en la azotea. Toca una sesión para ver los detalles.",
    noSessions: "Todavía no hay sesiones programadas.",
  },
  en: {
    appName: "Summer Cinema",
    language: "Language",
    navHome: "Home",
    navSchedule: "Schedule",
    calendar: "Calendar",
    seeFullSchedule: "See full schedule →",
    noUpcoming: "No upcoming screenings scheduled.",
    errorSchedule: "Couldn't load the schedule.",
    tapMarkedDay: "Tap a marked day to see the film.",
    close: "Close",
    nextScreening: "Next screening",
    pendingTag: "To be announced",
    pendingTitle: "To be confirmed",
    pendingExpanded: "This day's film will be announced soon.",
    daysUntilSession: (n) =>
      `${n} ${n === 1 ? "day" : "days"} until the screening`,
    carteleraTitle: "Schedule",
    carteleraIntro:
      "The full summer cinema schedule on the rooftop. Tap a session for details.",
    noSessions: "No sessions scheduled yet.",
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
