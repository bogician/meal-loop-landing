import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";

import { routing } from "@/i18n/routing";
import { SITE_ORIGIN } from "@/lib/site";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "MealLoop — Plan a week of meals from the dishes you already cook",
  description:
    "MealLoop is a calm weekly meal planner for small households. Build a library of the dishes you actually cook, plan the week, and let the grocery list write itself.",
  openGraph: {
    title: "MealLoop",
    description:
      "A calm weekly meal planner for small households. Plan a week from the dishes you already cook.",
    type: "website",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale — must run before any message read.
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
