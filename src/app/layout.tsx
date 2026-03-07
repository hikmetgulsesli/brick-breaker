import type { Metadata } from "next";
import { Orbitron, Rajdhani, Fira_Code } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/contexts/GameContext";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brick Breaker - Retro Arcade Game",
  description: "A classic brick breaker game built with Next.js and React",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${rajdhani.variable} ${firaCode.variable} antialiased`}>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
