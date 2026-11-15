import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "introverTrader | ATAS License Portal", description: "Manage your introverTrader ATAS indicator license." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
