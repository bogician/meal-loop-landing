import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
