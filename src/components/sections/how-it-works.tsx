"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/motion";

const STEPS = [
  {
    n: "01",
    title: "Build your library",
    body: "Add the dishes you already cook, with their ingredients. It grows a little each week.",
  },
  {
    n: "02",
    title: "Plan the week",
    body: "Assign dishes to days. Reuse last week, or duplicate a week that worked well.",
  },
  {
    n: "03",
    title: "Shop the list",
    body: "Your groceries arrive grouped by category and ready. Tick items off as you shop.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <FadeIn className="max-w-2xl">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three steps, then it mostly runs itself.
          </h2>
        </FadeIn>
        <Stagger className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <StaggerItem key={s.n}>
              <div className="font-heading text-5xl font-bold text-brand/30">
                {s.n}
              </div>
              <h3 className="mt-3 text-xl font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
