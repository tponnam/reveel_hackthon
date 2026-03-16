import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Reveel AI — Generate Product Demo Videos with AI",
  description:
    "Turn your product URL into studio-quality demo videos. No recording, no editing. AI-powered browser agent captures, narrates, and edits your demos automatically.",
  keywords: [
    "AI demo video",
    "product demo generator",
    "automated demo",
    "screen recording AI",
    "demo video maker",
    "SaaS demo",
  ],
  openGraph: {
    title: "Reveel AI — AI Demo Video Generator",
    description:
      "Turn your product into studio-quality demo videos. No recording or editing needed.",
    type: "website",
    url: "https://reveel.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", montserrat.variable)} suppressHydrationWarning>
      <body className={montserrat.className} suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
