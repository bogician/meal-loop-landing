"use client";

import { useTranslations } from "next-intl";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { DeviceMockup } from "@/components/device-mockup";
import {
  DishLibraryScreen,
  PlannerScreen,
  GroceriesScreen,
} from "@/components/screens";

const SHOTS = [
  { key: "library", screen: <DishLibraryScreen /> },
  { key: "planner", screen: <PlannerScreen /> },
  { key: "groceries", screen: <GroceriesScreen /> },
] as const;

export function Screenshots() {
  const t = useTranslations("screenshots");
  return (
    <section className="overflow-hidden border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <FadeIn className="max-w-2xl">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("heading")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("lead")}</p>
        </FadeIn>
        <Stagger className="mt-14 grid gap-10 sm:grid-cols-3">
          {SHOTS.map((s) => (
            <StaggerItem key={s.key} className="flex flex-col items-center">
              <DeviceMockup className="max-w-[240px]">{s.screen}</DeviceMockup>
              <p className="mt-5 text-center text-sm text-muted-foreground">
                {t(`captions.${s.key}`)}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
