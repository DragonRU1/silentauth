import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SilentAuth Verification",
  description: "Verify your identity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center">
        <main className="w-full max-w-lg px-6">{children}</main>
      </body>
    </html>
  );
}
