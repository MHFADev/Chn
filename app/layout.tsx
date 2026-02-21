import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ChaosBackground } from "../components/ChaosBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chaos Global Card Game - Play Real-Time Multiplayer Online",
  description: "A fast-paced, intensely chaotic real-time multiplayer card game inspired by UNO. Play against friends globally with unique Chaos and Bencana cards!",
  keywords: ["card game", "multiplayer game", "online uno", "chaos card game", "browser game", "real-time card game", "casual web game"],
  authors: [{ name: "Chaos Game Studios" }],
  openGraph: {
    title: "Chaos Global Card Game",
    description: "Experience the ultimate chaotic card game online with your friends. Unleash global effects, stack penalties, and survive the chaos!",
    url: "https://your-chaos-game-domain.vercel.app", // User can change this later
    siteName: "Chaos Global Card Game",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chaos Global Card Game",
    description: "A fast-paced, chaotic multiplayer card game. Play now in your browser!",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}
      >
        <ChaosBackground />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
