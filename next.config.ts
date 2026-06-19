import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Pin the workspace root: a stray lockfile in the home dir otherwise makes
  // Next infer the wrong root. The next-intl plugin spreads this turbopack
  // config through, so the pin is preserved by the wrap below.
  turbopack: {
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);
