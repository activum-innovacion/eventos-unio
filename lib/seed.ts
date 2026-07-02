import type { DB } from "./types";

/**
 * Datos iniciales del cine de verano de Unió Madrid.
 * La programación (screenings) la fija la comisión desde el panel; las
 * candidatas (candidates) son las películas abiertas a votación. Las que
 * proponen los residentes entran como status "pending" hasta aprobarse.
 */
export const seed: DB = {
  screenings: [
    {
      id: "scr-coco",
      title: "Coco",
      year: 2017,
      genre: "Animación · Familiar",
      duration: 105,
      rating: "TP",
      synopsis:
        "Miguel sueña con ser músico y acaba viajando a la Tierra de los Muertos para descubrir la verdad sobre la historia de su familia.",
      poster: { emoji: "💀🎸", from: "#7c3aed", to: "#f97316" },
      date: "2026-07-03",
      time: "22:00",
      location: "Azotea comunitaria",
    },
    {
      id: "scr-lalaland",
      title: "La La Land",
      year: 2016,
      genre: "Musical · Romance",
      duration: 128,
      rating: "+7",
      synopsis:
        "Una actriz y un pianista de jazz se enamoran en Los Ángeles mientras persiguen sus sueños en el mundo del espectáculo.",
      poster: { emoji: "🎹🌆", from: "#2563eb", to: "#db2777" },
      date: "2026-07-10",
      time: "22:00",
      location: "Azotea comunitaria",
    },
    {
      id: "scr-jurassic",
      title: "Parque Jurásico",
      year: 1993,
      genre: "Aventura · Ciencia ficción",
      duration: 127,
      rating: "+12",
      synopsis:
        "Un parque temático con dinosaurios clonados se convierte en una lucha por la supervivencia cuando la seguridad falla.",
      poster: { emoji: "🦖🌴", from: "#166534", to: "#ca8a04" },
      date: "2026-07-17",
      time: "22:15",
      location: "Azotea comunitaria",
    },
    {
      id: "scr-reyleon",
      title: "El Rey León",
      year: 1994,
      genre: "Animación · Familiar",
      duration: 88,
      rating: "TP",
      synopsis:
        "El joven león Simba debe aceptar su destino y reclamar su lugar como rey de la sabana tras la traición de su tío Scar.",
      poster: { emoji: "🦁🌅", from: "#b45309", to: "#facc15" },
      date: "2026-07-24",
      time: "22:15",
      location: "Azotea comunitaria",
    },
  ],
  candidates: [
    {
      id: "cnd-volver-al-futuro",
      title: "Regreso al futuro",
      year: 1985,
      genre: "Aventura · Comedia",
      synopsis:
        "Marty McFly viaja accidentalmente a 1955 en un DeLorean y debe asegurarse de que sus padres se enamoren para poder volver.",
      poster: { emoji: "🚗⚡", from: "#0ea5e9", to: "#f59e0b" },
      status: "approved",
      createdAt: "2026-06-20T10:00:00.000Z",
    },
    {
      id: "cnd-spiderverse",
      title: "Spider-Man: Un nuevo universo",
      year: 2018,
      genre: "Animación · Acción",
      synopsis:
        "Miles Morales descubre el multiverso arácnido y se une a otros Spider-Man para salvar la realidad.",
      poster: { emoji: "🕷️🌀", from: "#e11d48", to: "#4f46e5" },
      status: "approved",
      createdAt: "2026-06-20T10:05:00.000Z",
    },
    {
      id: "cnd-goonies",
      title: "Los Goonies",
      year: 1985,
      genre: "Aventura · Familiar",
      synopsis:
        "Un grupo de amigos busca el tesoro de un pirata para salvar sus casas de la demolición.",
      poster: { emoji: "🗺️💎", from: "#0d9488", to: "#eab308" },
      status: "approved",
      createdAt: "2026-06-21T09:00:00.000Z",
    },
    {
      id: "cnd-inside-out",
      title: "Del revés (Inside Out)",
      year: 2015,
      genre: "Animación · Familiar",
      synopsis:
        "Las emociones de una niña de once años intentan guiarla mientras se adapta a una nueva ciudad.",
      poster: { emoji: "😊😢", from: "#f59e0b", to: "#6366f1" },
      status: "approved",
      createdAt: "2026-06-22T18:30:00.000Z",
    },
    {
      id: "cnd-gladiator",
      title: "Gladiator",
      year: 2000,
      genre: "Épica · Acción",
      synopsis:
        "Un general romano traicionado se convierte en gladiador y busca vengarse del emperador que asesinó a su familia.",
      poster: { emoji: "⚔️🏛️", from: "#78350f", to: "#dc2626" },
      status: "approved",
      createdAt: "2026-06-23T20:00:00.000Z",
    },
    {
      id: "cnd-frozen",
      title: "Frozen: El reino del hielo",
      year: 2013,
      genre: "Animación · Familiar",
      synopsis:
        "La princesa Anna emprende un viaje para encontrar a su hermana Elsa, cuyos poderes han sumido el reino en un invierno eterno.",
      poster: { emoji: "❄️👑", from: "#0891b2", to: "#a78bfa" },
      status: "approved",
      createdAt: "2026-06-24T12:00:00.000Z",
    },
  ],
  votes: {
    "cnd-volver-al-futuro": ["seed-1", "seed-2", "seed-3", "seed-4", "seed-5"],
    "cnd-spiderverse": ["seed-1", "seed-2", "seed-6", "seed-7"],
    "cnd-goonies": ["seed-3", "seed-8"],
    "cnd-inside-out": ["seed-2", "seed-4", "seed-5", "seed-9", "seed-10", "seed-11"],
    "cnd-gladiator": ["seed-7", "seed-8", "seed-12"],
    "cnd-frozen": ["seed-1", "seed-9", "seed-10"],
  },
};
