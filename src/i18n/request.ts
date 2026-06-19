import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "@/i18n/routing";

type MessageTree = { [key: string]: string | MessageTree };

const isTree = (value: string | MessageTree | undefined): value is MessageTree =>
  typeof value === "object" && value !== null;

// Recursive merge so per-key fallback works inside namespaces: a partial locale
// namespace fills in over the English base instead of replacing it wholesale.
const deepMerge = (base: MessageTree, override: MessageTree): MessageTree => {
  const result: MessageTree = { ...base };
  for (const key of Object.keys(override)) {
    const baseValue = result[key];
    const overrideValue = override[key];
    result[key] =
      isTree(baseValue) && isTree(overrideValue)
        ? deepMerge(baseValue, overrideValue)
        : overrideValue;
  }
  return result;
};

// Resolves the active locale for each request and loads its message catalog.
// The default-locale (en) catalog is merged underneath as a fallback so keys
// missing from a locale fall back to English (FR-4). Full catalogs land later
// (en in Story 1.3, uk in Story 1.4); today these files are minimal seeds.
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const localeMessages = (await import(`../../messages/${locale}.json`))
    .default as MessageTree;
  const fallbackMessages = (
    await import(`../../messages/${routing.defaultLocale}.json`)
  ).default as MessageTree;

  return {
    locale,
    messages: deepMerge(fallbackMessages, localeMessages),
  };
});
