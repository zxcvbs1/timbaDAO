import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PrivyProvider from "../contexts/PrivyProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TimbaDAO - Juega y Ayuda",
  description: "La lotería más solidaria del mundo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <PrivyProvider>
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
