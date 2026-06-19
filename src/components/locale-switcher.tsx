"use client";

import { Fragment, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES, LOCALE_LABELS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const activeLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("localeSwitcher");

  // Deterministically return focus to the active control after a switch so AT
  // perceives the language/content change (UX-DR-12). The clicked button stays
  // mounted, but we re-focus the now-active one explicitly rather than trust
  // Next's soft-navigation focus behavior.
  const activeRef = useRef<HTMLButtonElement>(null);
  const switchedRef = useRef(false);
  useEffect(() => {
    if (switchedRef.current) {
      activeRef.current?.focus();
      switchedRef.current = false;
    }
  }, [activeLocale]);

  function switchTo(locale: (typeof LOCALES)[number]) {
    if (locale === activeLocale) return;
    switchedRef.current = true;
    router.replace(pathname, { locale, scroll: false });
  }

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1">
      {LOCALES.map((locale, i) => {
        const isActive = locale === activeLocale;
        return (
          <Fragment key={locale}>
            {i > 0 && <span aria-hidden className="h-5 w-px bg-border" />}
            <button
              type="button"
              ref={isActive ? activeRef : undefined}
              onClick={() => switchTo(locale)}
              aria-current={isActive ? "true" : undefined}
              aria-label={t(locale)}
              className={cn(
                "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm transition-colors",
                isActive
                  ? "font-semibold text-brand underline underline-offset-4"
                  : "font-medium text-muted-foreground hover:text-foreground",
              )}
            >
              {LOCALE_LABELS[locale]}
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}
