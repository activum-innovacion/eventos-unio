import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[640px] items-center justify-between px-4 pt-[calc(env(safe-area-inset-top)+0.7rem)] pb-2.5">
        <Link href="/" className="flex items-center" aria-label="ÜNIO Madrid — inicio">
          <Image
            src="/images/UNIO_LOGOTIPO_AZUL.png"
            alt="ÜNIO Madrid"
            width={190}
            height={90}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <span className="brand-heading text-[0.72rem] tracking-[0.12em] text-indigo">
          Cine de Verano
        </span>
      </div>
    </header>
  );
}
