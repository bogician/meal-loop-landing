import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/site";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" aria-label={tNav("home")} className="inline-flex">
            <Logo />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            {t("tagline")}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <a href="#" className="transition-colors hover:text-foreground">
            {t("privacy")}
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            {t("terms")}
          </a>
          <a
            href={`mailto:${SITE.email}`}
            className="transition-colors hover:text-foreground"
          >
            {t("contact")}
          </a>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        {t("copyright")}
      </div>
    </footer>
  );
}
