import type { Poster as PosterType } from "@/lib/types";

type Props = {
  poster: PosterType;
  imageUrl?: string;
  title?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Sesión pendiente de votación → placeholder con el isologo de ÚNIO */
  pending?: boolean;
};

const emojiSize = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-5xl",
};

const filmStrip = (
  <>
    <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-[repeating-linear-gradient(180deg,rgba(0,0,0,0.4)_0_5px,transparent_5px_11px)]" />
    <div className="pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-[repeating-linear-gradient(180deg,rgba(0,0,0,0.4)_0_5px,transparent_5px_11px)]" />
  </>
);

/**
 * Cartel de la película.
 *  - pending → placeholder de marca (isologo ÚNIO sobre índigo)
 *  - imageUrl → imagen subida desde el panel
 *  - si no → degradado + emoji
 */
export function Poster({
  poster,
  imageUrl,
  title,
  className = "",
  size = "md",
  pending = false,
}: Props) {
  if (pending) {
    return (
      <div
        className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl ${className}`}
        style={{ backgroundImage: "linear-gradient(150deg, #5b54a0, #322d63)" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_30%_0%,rgba(255,255,255,0.22),transparent_60%)]" />
        {filmStrip}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/UNIO_ISOLOGO_BLANCO.png"
          alt={title ?? "Pendiente de votación"}
          className="relative w-[58%] object-contain opacity-95"
          loading="lazy"
        />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl bg-cream ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={title ? `Cartel de ${title}` : "Cartel"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl ${className}`}
      style={{
        backgroundImage: `linear-gradient(150deg, ${poster.from}, ${poster.to})`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_30%_0%,rgba(255,255,255,0.35),transparent_60%)]" />
      {filmStrip}
      <span className={`relative drop-shadow ${emojiSize[size]}`} aria-hidden>
        {poster.emoji}
      </span>
    </div>
  );
}
