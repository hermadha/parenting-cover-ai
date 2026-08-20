import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parenting Cover AI",
  description: "Generate warm pastel parenting covers from real child photos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
