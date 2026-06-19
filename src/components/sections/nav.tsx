import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/logo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";
import { NAV_LINKS, APP_STORE_URL } from "@/lib/site";

export async function Nav() {
  const t = await getTranslations("nav");
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label={t("home")}>
          <Logo />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(`links.${l.key}`)}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <a
            href={APP_STORE_URL}
            className="hidden rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            {t("getApp")}
          </a>
        </div>
      </nav>
    </header>
  );
}
