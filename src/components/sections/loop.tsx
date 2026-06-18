"use client";

import { motion } from "motion/react";
import { FadeIn } from "@/components/motion";
import { LoopMark } from "@/components/logo";

const NODES = ["Cook", "Plan", "Shop", "Repeat"];

export function Loop() {
  return (
    <section id="loop" className="mx-auto max-w-6xl px-5 py-24">
      <div className="grid items-center gap-16 md:grid-cols-2">
        <FadeIn>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A week that comes back around.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Most weeks you cook the same handful of meals. MealLoop remembers
            them, so planning the next week takes minutes instead of a fresh
            start. Duplicate a week you liked and adjust from there.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="relative mx-auto flex h-72 w-72 items-center justify-center">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-dashed border-brand/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-mint">
              <LoopMark className="h-12 w-12" />
            </div>
            {NODES.map((node, i) => {
              const angle = (i / NODES.length) * 2 * Math.PI - Math.PI / 2;
              const x = Math.cos(angle) * 120;
              const y = Math.sin(angle) * 120;
              return (
                <div
                  key={node}
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  className="absolute rounded-full bg-card px-4 py-1.5 text-sm font-semibold text-foreground shadow-md ring-1 ring-border"
                >
                  {node}
                </div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
