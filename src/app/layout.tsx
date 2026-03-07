import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brick Breaker - Retro Edition",
  description: "Classic brick breaking game with modern web technologies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
