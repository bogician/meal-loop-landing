import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Mock MealLoop screens rendered in HTML/CSS for the device frames.
// Faithful to the app's patterns (Outfit display header, green circular
// action, boxed fields, grouped lists). Swap for real screenshots later.

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-4 text-[10px] font-semibold text-foreground">
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <span className="h-2 w-3.5 rounded-[2px] bg-foreground/80" />
        <span className="h-2 w-3.5 rounded-[2px] bg-foreground/60" />
        <span className="h-2 w-5 rounded-[3px] border border-foreground/50" />
      </div>
    </div>
  );
}

function ScreenHeader({
  title,
  subtitle,
  action = "plus",
}: {
  title: string;
  subtitle?: string;
  action?: "plus" | "chevrons" | "none";
}) {
  return (
    <div className="flex items-start justify-between px-5 pb-3 pt-3">
      <div>
        <h3 className="font-heading text-[1.6rem] font-bold leading-none tracking-tight text-foreground">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-[0.7rem] text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action === "plus" ? (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ) : null}
      {action === "chevrons" ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Chevron dir="left" />
          <Chevron dir="right" />
        </div>
      ) : null}
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-border">
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
        <path
          d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-3 shadow-[0_1px_2px_rgba(26,25,24,0.06)] ring-1 ring-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

function TabBar({ active }: { active: "dishes" | "planner" | "groceries" }) {
  const tabs = [
    { id: "dishes", label: "Dishes", icon: "M4 5h16M4 12h16M4 19h10" },
    { id: "planner", label: "Planner", icon: "M5 4h14v16H5zM5 9h14M9 4v16" },
    {
      id: "groceries",
      label: "Groceries",
      icon: "M6 7h12l-1 12H7zM9 7a3 3 0 0 1 6 0",
    },
  ] as const;
  return (
    <div className="mt-auto flex items-center justify-around border-t border-border bg-card/80 px-2 pb-5 pt-2 backdrop-blur">
      {tabs.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex flex-col items-center gap-1 text-[0.6rem]",
            active === t.id ? "text-brand" : "text-muted-foreground/70",
          )}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
            <path
              d={t.icon}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t.label}
        </div>
      ))}
    </div>
  );
}

function DishRow({
  emoji,
  name,
  tags,
  fav,
}: {
  emoji: string;
  name: string;
  tags: string;
  fav?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint text-lg">
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.8rem] font-semibold text-foreground">
          {name}
        </p>
        <p className="truncate text-[0.65rem] text-muted-foreground">{tags}</p>
      </div>
      <svg
        viewBox="0 0 24 24"
        className={cn("h-4 w-4", fav ? "text-warm" : "text-border")}
        fill={fav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden
      >
        <path d="M12 3l2.6 5.3 5.9.9-4.3 4.2 1 5.8L12 16.9 6.8 19.4l1-5.8L3.5 9.2l5.9-.9z" />
      </svg>
    </div>
  );
}

export function DishLibraryScreen() {
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <ScreenHeader title="Your Dishes" action="plus" />
      <div className="px-5">
        <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 ring-1 ring-border">
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 text-muted-foreground"
            fill="none"
            aria-hidden
          >
            <circle
              cx="11"
              cy="11"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M20 20l-3.5-3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[0.7rem] text-muted-foreground">
            Search dishes
          </span>
        </div>
      </div>
      <div className="mt-3 flex-1 space-y-2 overflow-hidden px-5">
        <Card className="divide-y divide-border py-0">
          <DishRow emoji="🍝" name="Pasta carbonara" tags="Pasta · 25 min" fav />
          <DishRow emoji="🥗" name="Halloumi salad" tags="Salad · 15 min" />
          <DishRow emoji="🍲" name="Lentil stew" tags="Soup · Batch" fav />
          <DishRow emoji="🌮" name="Black bean tacos" tags="Mexican · 20 min" />
          <DishRow emoji="🍳" name="Shakshuka" tags="Brunch · 30 min" />
        </Card>
      </div>
      <TabBar active="dishes" />
    </div>
  );
}

function MealSlot({
  meal,
  dish,
  emoji,
}: {
  meal: string;
  dish?: string;
  emoji?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-[0.6rem] uppercase tracking-wide text-muted-foreground">
        {meal}
      </span>
      {dish ? (
        <span className="flex flex-1 items-center gap-1.5 rounded-lg bg-mint px-2 py-1 text-[0.7rem] font-medium text-accent-foreground">
          <span>{emoji}</span>
          {dish}
        </span>
      ) : (
        <span className="flex-1 rounded-lg border border-dashed border-border px-2 py-1 text-[0.65rem] text-muted-foreground/70">
          Add a dish
        </span>
      )}
    </div>
  );
}

export function PlannerScreen() {
  const days = [
    { day: "Mon", date: "16", b: { dish: "Shakshuka", emoji: "🍳" }, d: { dish: "Pasta carbonara", emoji: "🍝" } },
    { day: "Tue", date: "17", d: { dish: "Lentil stew", emoji: "🍲" } },
    { day: "Wed", date: "18", l: { dish: "Halloumi salad", emoji: "🥗" }, d: { dish: "Black bean tacos", emoji: "🌮" } },
  ];
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <ScreenHeader title="This Week" subtitle="16–22 June" action="chevrons" />
      <div className="mt-1 flex-1 space-y-2.5 overflow-hidden px-4">
        {days.map((d) => (
          <Card key={d.day} className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-sm font-bold text-foreground">
                {d.day}
              </span>
              <span className="text-[0.65rem] text-muted-foreground">
                {d.date} June
              </span>
            </div>
            <div className="space-y-1.5">
              <MealSlot meal="Break." dish={d.b?.dish} emoji={d.b?.emoji} />
              <MealSlot meal="Lunch" dish={d.l?.dish} emoji={d.l?.emoji} />
              <MealSlot meal="Dinner" dish={d.d?.dish} emoji={d.d?.emoji} />
            </div>
          </Card>
        ))}
      </div>
      <TabBar active="planner" />
    </div>
  );
}

function GroceryItem({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-md border",
          checked ? "border-brand bg-brand text-brand-foreground" : "border-border",
        )}
      >
        {checked ? (
          <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" aria-hidden>
            <path
              d="M5 12l4 4 10-10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span
        className={cn(
          "text-[0.75rem]",
          checked
            ? "text-muted-foreground/60 line-through"
            : "text-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function GroceryGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <Card className="py-1">{children}</Card>
    </div>
  );
}

export function GroceriesScreen() {
  return (
    <div className="flex h-full flex-col">
      <StatusBar />
      <ScreenHeader title="Groceries" subtitle="This week · 6 of 14" action="none" />
      <div className="mt-1 flex-1 space-y-3 overflow-hidden px-5">
        <GroceryGroup title="Produce">
          <GroceryItem label="Cherry tomatoes" checked />
          <GroceryItem label="Romaine lettuce" />
          <GroceryItem label="Red onion" checked />
        </GroceryGroup>
        <GroceryGroup title="Dairy">
          <GroceryItem label="Halloumi" />
          <GroceryItem label="Eggs, dozen" checked />
        </GroceryGroup>
        <GroceryGroup title="Pantry">
          <GroceryItem label="Spaghetti" checked />
          <GroceryItem label="Black beans" />
          <GroceryItem label="Red lentils" />
        </GroceryGroup>
      </div>
      <TabBar active="groceries" />
    </div>
  );
}
