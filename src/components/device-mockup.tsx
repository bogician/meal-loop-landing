import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// An iPhone frame that renders mock app UI (or, later, a real screenshot).
// The bezel color is fixed so it reads as a device in both light and dark.
export function DeviceMockup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("relative w-full max-w-[300px]", className)}>
      <div className="relative rounded-[3rem] bg-[#1f1c19] p-[0.7rem] shadow-[0_40px_80px_-20px_rgba(26,25,24,0.45)] ring-1 ring-black/10">
        {/* Dynamic island */}
        <div className="absolute left-1/2 top-[1.4rem] z-20 h-[1.5rem] w-[6rem] -translate-x-1/2 rounded-full bg-black" />
        {/* Screen */}
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.4rem] bg-paper">
          {children}
        </div>
      </div>
    </div>
  );
}
