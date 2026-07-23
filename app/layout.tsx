import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Fira_Code } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const title = "Piper — Repo-Aware AI Coding Agent";
const description =
  "Plan the work. Choose the path. Ship with control. Piper drafts a plan, pauses for your decisions, searches the web, and ships only what you approve.";

export const metadata: Metadata = {
  metadataBase: new URL("https://piper.codecoves.in"),
  title,
  description,
  applicationName: "Piper",
  openGraph: {
    type: "website",
    url: "https://piper.codecoves.in",
    siteName: "Piper",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${firaCode.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
