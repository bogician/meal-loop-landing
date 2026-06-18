import { cn } from "@/lib/utils";

// The "loop" mark — a circular arrow evoking the weekly meal loop, in brand green.
export function LoopMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-7 w-7 text-brand", className)}
      aria-hidden
    >
      <path
        d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3M19.5 12a7.5 7.5 0 0 1-12.8 5.3"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M17.8 3.3v3.6h-3.6M6.2 20.7v-3.6h3.6"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LoopMark />
      <span className="text-xl font-semibold tracking-tight text-foreground">
        MealLoop
      </span>
    </span>
  );
}
