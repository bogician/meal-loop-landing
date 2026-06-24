import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DEFAULT_LOCALE, localeUrl, SITE } from "@/lib/site";
import { buildStructuredData } from "@/lib/structured-data";
import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Features } from "@/components/sections/features";
import { Loop } from "@/components/sections/loop";
import { Screenshots } from "@/components/sections/screenshots";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";

// 404 any locale the layout's generateStaticParams didn't prebuild, so a stray
// locale can't reach generateMetadata and mint a self-canonical to a dead page.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>): Promise<Metadata> {
  const { locale } = await params;
  // Keep this route statically prerendered (AR-4): no cookies()/headers().
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: localeUrl(locale),
      languages: {
        en: localeUrl("en"),
        uk: localeUrl("uk"),
        "x-default": localeUrl(DEFAULT_LOCALE),
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      url: localeUrl(locale),
      title: t("title"),
      description: t("description"),
      // No `images`: the Story 2.3 opengraph-image route supplies the
      // per-locale og:image via mergeStaticMetadata, which only merges the
      // file-convention image when this block omits `images`.
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      // No `images`: twitter:image is derived from the opengraph-image route
      // for the same reason — omitting it keeps the URL single-sourced.
    },
  };
}

export default async function Home({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  // Required on every page (not just the layout) for static rendering — Next
  // may render page and layout in parallel, so the layout's call isn't enough.
  const { locale } = await params;
  setRequestLocale(locale);

  // Reuse the localized metadata.description (Story 3.2) as the single product
  // summary — no new catalog namespace, en/uk key trees stay identical (AR-15).
  const t = await getTranslations({ locale, namespace: "metadata" });
  const jsonLd = buildStructuredData({ locale, description: t("description") });

  return (
    <>
      {/* JSON-LD (FR-9): one script, payload from the single typed builder. The
          .replace scrub escapes "<" per the bundled Next json-ld guide so the
          payload cannot break out of the <script> element. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Nav />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Loop />
        <Screenshots />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
