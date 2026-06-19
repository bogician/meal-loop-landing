import { createNavigation } from "next-intl/navigation";

import { routing } from "@/i18n/routing";

// Locale-aware navigation helpers. Use these for internal route navigation —
// never hand-build `/${locale}/...` strings or import next/link / next/navigation.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
