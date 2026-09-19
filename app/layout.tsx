import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Villa Ipê | Criartista Hospedagens",
  description: "Protótipo base do Criartista Hospedagens"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
