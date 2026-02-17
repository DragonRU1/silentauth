import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SilentAuth Dashboard",
  description: "Manage your SilentAuth projects and sessions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="border-b border-gray-800 px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">
              Silent<span className="text-indigo-400">Auth</span>
            </h1>
            <div className="flex gap-4 text-sm">
              <a href="/" className="text-gray-400 hover:text-white">Dashboard</a>
              <a href="/projects" className="text-gray-400 hover:text-white">Projects</a>
              <a href="/sessions" className="text-gray-400 hover:text-white">Sessions</a>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
