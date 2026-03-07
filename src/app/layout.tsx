import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import { GameProvider } from "@/contexts/GameContext";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Retro Brick Breaker",
  description: "Classic brick breaker game with modern web technologies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} antialiased bg-bg-dark`}
      >
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
