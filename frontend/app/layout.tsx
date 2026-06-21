import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "MedSupply AI — Pharmacy Procurement Platform",
  description:
    "AI-powered pharmacy procurement: inventory analysis, stockout & expiry prediction, supplier optimization, and automated purchase orders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
