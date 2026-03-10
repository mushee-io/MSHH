import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mushee Flow",
  description: "AI payments and usage metering on Polygon"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
