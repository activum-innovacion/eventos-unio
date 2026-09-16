"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

export function SiteHeader() {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[640px] items-center justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top)+0.7rem)] pb-2.5">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="ÚNIO Madrid"
        >
          <Image
            src="/images/UNIO_LOGOTIPO_AZUL.png"
            alt="ÚNIO Madrid"
            width={112}
            height={53}
            priority
            className="h-7 w-auto shrink-0"
          />
          <span className="brand-heading truncate text-[0.72rem] tracking-[0.1em] text-indigo">
            {t.appName}
          </span>
        </Link>
        <LanguageToggle />
      </div>
    </header>
  );
}
