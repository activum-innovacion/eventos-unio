import Image from "next/image";
import Link from "next/link";

/**
 * Chrome mínimo para las páginas de encuesta (/encuestas y /respuestas):
 * solo el logo de ÜNIO centrado, sin barra de navegación ni selector de
 * idioma. Son páginas a las que se llega por enlace directo/QR, no desde el
 * menú de la web.
 */
export default function SurveyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-[640px] flex-col px-4 pb-16 pt-6">
      <header className="mb-6 flex justify-center">
        <Link href="/" aria-label="ÜNIO Madrid">
          <Image
            src="/images/UNIO_LOGOTIPO_AZUL.png"
            alt="ÜNIO Madrid"
            width={160}
            height={76}
            priority
            className="h-9 w-auto"
          />
        </Link>
      </header>
      {children}
    </div>
  );
}
