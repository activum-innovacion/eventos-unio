import { SiteHeader } from "@/components/SiteHeader";
import { BottomNav } from "@/components/BottomNav";
import { LanguageProvider } from "@/lib/i18n";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto w-full max-w-[640px] flex-1 px-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+6rem)]">
          {children}
        </main>
        <BottomNav />
      </div>
    </LanguageProvider>
  );
}
