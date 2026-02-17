"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface AuthResponse {
  token: string;
  organization?: { id: string; name: string };
  user?: { id: string; email: string; role: string };
}

export default function HomePage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      if (mode === "register") {
        const res = await api<AuthResponse>("/api/auth/register", {
          body: { name: orgName, adminEmail: email, adminPassword: password },
        });
        setToken(res.token);
        localStorage.setItem("sa_token", res.token);
      } else {
        const res = await api<AuthResponse>("/api/auth/login", {
          body: { email, password },
        });
        setToken(res.token);
        localStorage.setItem("sa_token", res.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (token) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Welcome to SilentAuth</h2>
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <p className="mb-2 text-sm text-gray-400">Your JWT Token (saved to localStorage):</p>
          <code className="block break-all rounded bg-gray-800 p-3 text-xs text-green-400">
            {token}
          </code>
        </div>
        <div className="flex gap-4">
          <a
            href="/projects"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
          >
            Manage Projects
          </a>
          <a
            href="/sessions"
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800"
          >
            View Sessions
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h2 className="text-2xl font-bold">{mode === "login" ? "Sign In" : "Create Organization"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <input
            type="text"
            placeholder="Organization Name"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          required
          minLength={8}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium hover:bg-indigo-500"
        >
          {mode === "login" ? "Sign In" : "Register"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        {mode === "login" ? "No account? " : "Already have an account? "}
        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="text-indigo-400 hover:underline"
        >
          {mode === "login" ? "Create Organization" : "Sign In"}
        </button>
      </p>
    </div>
  );
}
