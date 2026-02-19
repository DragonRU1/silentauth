"use client";

import { useState, useEffect } from "react";

export default function NavBar() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sa_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsSuperAdmin(payload.role === "SUPER_ADMIN");
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <nav className="border-b border-gray-800 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">
          Silent<span className="text-indigo-400">Auth</span>
        </h1>
        <div className="flex gap-4 text-sm">
          <a href="/" className="text-gray-400 hover:text-white">Dashboard</a>
          <a href="/projects" className="text-gray-400 hover:text-white">Projects</a>
          <a href="/sessions" className="text-gray-400 hover:text-white">Sessions</a>
          {isSuperAdmin && (
            <a href="/admin" className="text-red-400 hover:text-red-300 font-medium">Admin</a>
          )}
        </div>
      </div>
    </nav>
  );
}
