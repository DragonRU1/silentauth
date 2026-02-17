"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import { fetchSession, verifySession } from "@/lib/api";

interface SessionData {
  id: string;
  token: string;
  status: "PENDING" | "VERIFIED" | "EXPIRED";
  expiresAt: string;
  callbackUrl?: string;
}

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get("token");

  const [session, setSession] = useState<SessionData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "verifying" | "done" | "error">("loading");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) {
      setError("No token provided. Use ?token=YOUR_TOKEN");
      setStatus("error");
      return;
    }

    try {
      const data = await fetchSession(token) as SessionData;
      setSession(data);

      if (data.status === "VERIFIED") {
        setStatus("done");
      } else if (data.status === "EXPIRED") {
        setError("This session has expired.");
        setStatus("error");
      } else {
        setStatus("ready");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
      setStatus("error");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleVerify() {
    if (!token) return;
    setStatus("verifying");

    try {
      const data = await verifySession(token, {
        verifiedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
      }) as SessionData;
      setSession(data);
      setStatus("done");

      // Auto-redirect after 2 seconds if callbackUrl exists
      if (data.callbackUrl) {
        setTimeout(() => {
          window.location.href = data.callbackUrl as string;
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="mt-4 text-gray-400">Loading session...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-lg border border-red-800 bg-red-950 p-6 text-center">
        <h2 className="text-lg font-semibold text-red-300">Error</h2>
        <p className="mt-2 text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-green-800 bg-green-950 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-900">
          <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-green-300">Verified</h2>
        <p className="mt-2 text-sm text-green-400">Session has been verified successfully.</p>
        {session?.callbackUrl ? (
          <p className="mt-3 text-sm text-gray-400">
            Redirecting back...{" "}
            <a href={session.callbackUrl} className="text-indigo-400 hover:underline">
              Click here if not redirected
            </a>
          </p>
        ) : (
          <p className="mt-2 text-xs text-gray-500">You can close this window.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-2xl font-bold">
        Silent<span className="text-indigo-400">Auth</span> Verification
      </h2>

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 space-y-3">
        <p className="text-sm text-gray-400">You have been asked to verify an action.</p>
        <p className="text-xs text-gray-500">Session: {session?.token}</p>
        <p className="text-xs text-gray-500">
          Expires: {session ? new Date(session.expiresAt).toLocaleString() : ""}
        </p>
      </div>

      <button
        onClick={handleVerify}
        disabled={status === "verifying"}
        className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-medium hover:bg-indigo-500 disabled:opacity-50"
      >
        {status === "verifying" ? "Verifying..." : "Confirm & Verify"}
      </button>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-gray-400">Loading...</div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
