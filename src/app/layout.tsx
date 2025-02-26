import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scaffold - Modern Next.js Starter",
  description:
    "A modern, full-stack starter template with authentication, internationalization, and ready-to-use components.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
