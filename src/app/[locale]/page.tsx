import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DEFAULT_LOCALE, localeUrl } from "@/lib/site";
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
  };
}

export default async function Home({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  // Required on every page (not just the layout) for static rendering — Next
  // may render page and layout in parallel, so the layout's call isn't enough.
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
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
