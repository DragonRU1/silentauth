"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface Session {
  id: string;
  token: string;
  status: "PENDING" | "VERIFIED" | "EXPIRED";
  proofData: Record<string, unknown> | null;
  createdAt: string;
  expiresAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-900 text-yellow-300",
  VERIFIED: "bg-green-900 text-green-300",
  EXPIRED: "bg-red-900 text-red-300",
};

export default function SessionsPage() {
  const [apiKey, setApiKey] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState("");

  async function loadSessions() {
    setError("");
    try {
      const data = await api<Session[]>("/api/sessions", { apiKey });
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
    }
  }

  async function createSession() {
    setError("");
    try {
      await api<Session>("/api/sessions", { method: "POST", apiKey });
      loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sessions</h2>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Paste your API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          onClick={loadSessions}
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-800"
        >
          Load
        </button>
        <button
          onClick={createSession}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
        >
          + New Session
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s.id} className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                    {s.status}
                  </span>
                  <span className="text-xs text-gray-500">{s.id}</span>
                </div>
                <p className="text-sm">
                  Token: <code className="text-xs text-indigo-400">{s.token}</code>
                </p>
                <p className="text-xs text-gray-500">
                  Verification link:{" "}
                  <a
                    href={`http://localhost:3001/verify?token=${s.token}`}
                    target="_blank"
                    className="text-indigo-400 hover:underline"
                  >
                    http://localhost:3001/verify?token={s.token}
                  </a>
                </p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p>Created: {new Date(s.createdAt).toLocaleString()}</p>
                <p>Expires: {new Date(s.expiresAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
        {sessions.length === 0 && apiKey && (
          <p className="text-center text-sm text-gray-500">No sessions found. Create one above.</p>
        )}
      </div>
    </div>
  );
}
