"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  createdAt: string;
  _count: { actionSessions: number; apiKeys: number };
}

interface CreateResult {
  project: Project;
  apiKey: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("sa_token"));
    setReady(true);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api<Project[]>("/api/projects", { token });
      setProjects(data);
    } catch {
      setError("Failed to load projects. Are you logged in?");
    }
  }, [token]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setNewApiKey(null);

    try {
      const res = await api<CreateResult>("/api/projects", {
        body: { name },
        token,
      });
      setNewApiKey(res.apiKey);
      setName("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    }
  }

  if (!ready) {
    return null;
  }

  if (!token) {
    return (
      <div className="text-center text-gray-400">
        <p>Please <a href="/" className="text-indigo-400 hover:underline">sign in</a> first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Projects</h2>

      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          type="text"
          placeholder="New project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
        >
          Create
        </button>
      </form>

      {newApiKey && (
        <div className="rounded-lg border border-yellow-700 bg-yellow-950 p-4">
          <p className="mb-2 text-sm font-medium text-yellow-300">
            API Key (copy now -- it won't be shown again):
          </p>
          <code className="block break-all rounded bg-gray-800 p-3 text-xs text-green-400">
            {newApiKey}
          </code>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="rounded-lg border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-xs text-gray-500">ID: {p.id}</p>
              </div>
              <div className="flex gap-4 text-sm text-gray-400">
                <span>{p._count.actionSessions} sessions</span>
                <span>{p._count.apiKeys} keys</span>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-center text-sm text-gray-500">No projects yet. Create one above.</p>
        )}
      </div>
    </div>
  );
}
