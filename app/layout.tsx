import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wizlo Checkout Prototypes",
  description: "One-page vs Multi-page vs Hybrid checkout A/B prototypes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
