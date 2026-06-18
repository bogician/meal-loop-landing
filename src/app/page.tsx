import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Features } from "@/components/sections/features";
import { Loop } from "@/components/sections/loop";
import { Screenshots } from "@/components/sections/screenshots";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";

export default function Home() {
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
