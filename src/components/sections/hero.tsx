"use client";

import { motion } from "motion/react";
import { FadeIn } from "@/components/motion";
import { AppStoreButton } from "@/components/app-store-button";
import { DeviceMockup } from "@/components/device-mockup";
import { PlannerScreen } from "@/components/screens";
import { SITE } from "@/lib/site";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-warm/15 blur-3xl" />
      </div>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <FadeIn>
            <span className="inline-flex items-center rounded-full bg-mint px-3 py-1 text-xs font-medium text-accent-foreground">
              For small households
            </span>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Plan a week of meals from the dishes you already cook.
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              {SITE.description}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <AppStoreButton />
              <a
                href="#how-it-works"
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                See how it works
              </a>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              On iPhone, iOS 17 and later.
            </p>
          </FadeIn>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="flex justify-center"
        >
          <DeviceMockup>
            <PlannerScreen />
          </DeviceMockup>
        </motion.div>
      </div>
    </section>
  );
}
