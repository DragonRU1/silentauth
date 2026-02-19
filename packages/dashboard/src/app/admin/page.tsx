"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

type Tab = "stats" | "organizations" | "users" | "sessions";

interface Stats {
  organizations: number;
  users: number;
  projects: number;
  sessions: number;
  verified: number;
  pending: number;
  expired: number;
}

interface Org {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  _count: { users: number; projects: number };
}

interface UserItem {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  organization: { id: string; name: string } | null;
}

interface SessionItem {
  id: string;
  token: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  project: { id: string; name: string; organization: { id: string; name: string } };
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("sa_token");
    if (t) {
      setToken(t);
      try {
        const payload = JSON.parse(atob(t.split(".")[1]));
        setRole(payload.role);
      } catch {
        setRole(null);
      }
    }
  }, []);

  const loadData = useCallback(async (activeTab: Tab, t: string) => {
    setError("");
    try {
      switch (activeTab) {
        case "stats":
          setStats(await api<Stats>("/api/admin/stats", { token: t }));
          break;
        case "organizations":
          setOrgs(await api<Org[]>("/api/admin/organizations", { token: t }));
          break;
        case "users":
          setUsers(await api<UserItem[]>("/api/admin/users", { token: t }));
          break;
        case "sessions":
          setSessions(await api<SessionItem[]>("/api/admin/sessions", { token: t }));
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  }, []);

  useEffect(() => {
    if (token && role === "SUPER_ADMIN") {
      loadData(tab, token);
    }
  }, [token, role, tab, loadData]);

  if (!token) {
    return <p className="text-gray-400">Please sign in first.</p>;
  }

  if (role !== "SUPER_ADMIN") {
    return <p className="text-red-400">Access denied. Super-admin only.</p>;
  }

  async function toggleOrg(orgId: string, active: boolean) {
    if (!token) return;
    try {
      await api(`/api/admin/organizations/${orgId}`, {
        method: "PATCH",
        token,
        body: { active },
      });
      setOrgs((prev) => prev.map((o) => (o.id === orgId ? { ...o, active } : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function removeUser(userId: string) {
    if (!token || !confirm("Delete this user?")) return;
    try {
      await api(`/api/admin/users/${userId}`, { method: "DELETE", token });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "stats", label: "Statistics" },
    { key: "organizations", label: "Organizations" },
    { key: "users", label: "Users" },
    { key: "sessions", label: "Sessions" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Super Admin Panel</h2>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? "bg-indigo-600 text-white"
                : "border border-gray-700 text-gray-400 hover:bg-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {tab === "stats" && stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Organizations", value: stats.organizations },
            { label: "Users", value: stats.users },
            { label: "Projects", value: stats.projects },
            { label: "Total Sessions", value: stats.sessions },
            { label: "Verified", value: stats.verified, color: "text-green-400" },
            { label: "Pending", value: stats.pending, color: "text-yellow-400" },
            { label: "Expired", value: stats.expired, color: "text-gray-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <p className="text-sm text-gray-400">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color ?? "text-white"}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "organizations" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-800 text-gray-400">
              <tr>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Users</th>
                <th className="pb-2 pr-4">Projects</th>
                <th className="pb-2 pr-4">Created</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-medium">{org.name}</td>
                  <td className="py-2 pr-4">
                    <span className={org.active ? "text-green-400" : "text-red-400"}>
                      {org.active ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{org._count.users}</td>
                  <td className="py-2 pr-4">{org._count.projects}</td>
                  <td className="py-2 pr-4 text-gray-400">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => toggleOrg(org.id, !org.active)}
                      className={`rounded px-3 py-1 text-xs font-medium ${
                        org.active
                          ? "bg-red-900/50 text-red-400 hover:bg-red-900"
                          : "bg-green-900/50 text-green-400 hover:bg-green-900"
                      }`}
                    >
                      {org.active ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orgs.length === 0 && <p className="mt-4 text-gray-500">No organizations yet.</p>}
        </div>
      )}

      {tab === "users" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-800 text-gray-400">
              <tr>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Organization</th>
                <th className="pb-2 pr-4">Created</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-800/50">
                  <td className="py-2 pr-4">{user.email}</td>
                  <td className="py-2 pr-4">
                    <span className={user.role === "ADMIN" ? "text-indigo-400" : "text-gray-400"}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{user.organization?.name ?? "—"}</td>
                  <td className="py-2 pr-4 text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => removeUser(user.id)}
                      className="rounded bg-red-900/50 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="mt-4 text-gray-500">No users yet.</p>}
        </div>
      )}

      {tab === "sessions" && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-800 text-gray-400">
              <tr>
                <th className="pb-2 pr-4">Token</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2 pr-4">Project</th>
                <th className="pb-2 pr-4">Organization</th>
                <th className="pb-2 pr-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-b border-gray-800/50">
                  <td className="py-2 pr-4 font-mono text-xs">{s.token.slice(0, 12)}...</td>
                  <td className="py-2 pr-4">
                    <span
                      className={
                        s.status === "VERIFIED"
                          ? "text-green-400"
                          : s.status === "PENDING"
                            ? "text-yellow-400"
                            : "text-gray-500"
                      }
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4">{s.project.name}</td>
                  <td className="py-2 pr-4">{s.project.organization.name}</td>
                  <td className="py-2 pr-4 text-gray-400">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessions.length === 0 && <p className="mt-4 text-gray-500">No sessions yet.</p>}
        </div>
      )}
    </div>
  );
}
