import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { AppShell } from "../components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LoopZ — From rough idea to verified build",
    template: "%s · LoopZ",
  },
  description: "Turn a software idea into a confirmed AI coding task, assess the returned evidence, and repair only what remains unresolved.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} data-scroll-behavior="smooth">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
