import { setRequestLocale } from "next-intl/server";

import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Features } from "@/components/sections/features";
import { Loop } from "@/components/sections/loop";
import { Screenshots } from "@/components/sections/screenshots";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";

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
