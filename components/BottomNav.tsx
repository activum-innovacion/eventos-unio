"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilmIcon, HeartIcon, HomeIcon, PlusCircleIcon } from "./icons";

const items = [
  { href: "/", label: "Inicio", Icon: HomeIcon },
  { href: "/cartelera", label: "Cartelera", Icon: FilmIcon },
  { href: "/votaciones", label: "Votaciones", Icon: HeartIcon },
  { href: "/proponer", label: "Proponer", Icon: PlusCircleIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur-md">
      <ul className="mx-auto flex max-w-[640px] items-stretch justify-around px-2 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-2">
        {items.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`group flex flex-col items-center gap-1 py-1 text-[0.64rem] font-semibold transition-colors ${
                  active ? "text-indigo" : "text-muted hover:text-ink"
                }`}
              >
                <span
                  className={`grid h-7 w-14 place-items-center rounded-full transition-colors ${
                    active ? "bg-indigo/10" : "group-active:bg-cream"
                  }`}
                >
                  <Icon className="h-[1.4rem] w-[1.4rem]" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
