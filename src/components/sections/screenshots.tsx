"use client";

import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { DeviceMockup } from "@/components/device-mockup";
import {
  DishLibraryScreen,
  PlannerScreen,
  GroceriesScreen,
} from "@/components/screens";

const SHOTS = [
  {
    key: "library",
    screen: <DishLibraryScreen />,
    caption: "Your dishes, with ingredients attached.",
  },
  {
    key: "planner",
    screen: <PlannerScreen />,
    caption: "A calm, seven-day plan.",
  },
  {
    key: "groceries",
    screen: <GroceriesScreen />,
    caption: "One grouped list, ready to shop.",
  },
];

export function Screenshots() {
  return (
    <section className="overflow-hidden border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <FadeIn className="max-w-2xl">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            See it in your hand.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The same quiet design across every screen, from the library to the
            list you carry to the shop.
          </p>
        </FadeIn>
        <Stagger className="mt-14 grid gap-10 sm:grid-cols-3">
          {SHOTS.map((s) => (
            <StaggerItem key={s.key} className="flex flex-col items-center">
              <DeviceMockup className="max-w-[240px]">{s.screen}</DeviceMockup>
              <p className="mt-5 text-center text-sm text-muted-foreground">
                {s.caption}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
