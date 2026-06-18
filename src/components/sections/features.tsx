"use client";

import { BookOpen, CalendarDays, ShoppingBasket, Camera } from "lucide-react";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Your dish library",
    body: "Keep every meal you cook in one place, with its ingredients attached. No more starting from a blank page each week.",
  },
  {
    icon: CalendarDays,
    title: "A simple weekly plan",
    body: "Drop dishes into a seven-day grid. Breakfast, lunch, dinner — plan as much or as little as you like.",
  },
  {
    icon: ShoppingBasket,
    title: "Groceries that write themselves",
    body: "Every dish you plan adds its ingredients to one grouped shopping list. Check things off as you shop.",
  },
  {
    icon: Camera,
    title: "Add a dish from a photo",
    body: "Photograph a meal and MealLoop drafts the dish and its ingredients. You review and save in seconds.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-5 py-20">
      <FadeIn className="max-w-2xl">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Everything the weekly shop needs, and nothing it does not.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          MealLoop is built around one quiet loop: the dishes you cook, the week
          you plan, the list you shop.
        </p>
      </FadeIn>
      <Stagger className="mt-12 grid gap-6 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <StaggerItem key={f.title}>
            <div className="h-full rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-brand">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
