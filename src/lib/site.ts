// Site-wide constants for the MealLoop marketing site.

// MealLoop is not on the App Store yet. When the listing is live, replace this
// single value with the real product URL and every App Store button updates.
export const APP_STORE_URL = "#";
export const APP_STORE_LIVE = APP_STORE_URL !== "#";

export const SITE = {
  name: "MealLoop",
  tagline: "Plan a week of meals from the dishes you already cook.",
  description:
    "A calm weekly meal planner for small households. Build a library of the dishes you actually cook, plan the week, and let the grocery list write itself.",
  email: "hello@meal-loop.com",
} as const;

export const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "The loop", href: "#loop" },
] as const;
