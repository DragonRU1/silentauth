import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./NavBar";

export const metadata: Metadata = {
  title: "SilentAuth Dashboard",
  description: "Manage your SilentAuth projects and sessions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <NavBar />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
