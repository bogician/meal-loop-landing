import createMiddleware from "next-intl/middleware";

import { routing } from "@/i18n/routing";

// Next 16 renamed `middleware` to `proxy`; the framework picks up a single
// default-exported function. next-intl's createMiddleware handles locale
// negotiation/redirects (e.g. `/` -> `/en`). Located at src/proxy.ts so it sits
// at the same level as src/app, per node_modules/.../proxy.md.
export default createMiddleware(routing);

export const config = {
  // Static literal (Next requires a build-time-analyzable matcher). Matches all
  // paths except API routes, Next/Vercel internals, and files with a dot.
  // The empty match also covers `/`, so the locale-less root gets redirected.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
