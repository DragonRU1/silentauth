import { Request, Response } from "express";
import * as sessionService from "../services/session.service";
import type { ApiKeyRequest, CreateSessionInput, VerifySessionInput } from "../types";
import type { SessionStatus } from "@prisma/client";

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { apiKey } = req as ApiKeyRequest;
    if (!apiKey.scopes.includes("session:create")) {
      res.status(403).json({ error: "API key lacks session:create scope" });
      return;
    }

    const { callbackUrl } = req.body as CreateSessionInput;
    const session = await sessionService.createSession({
      projectId: apiKey.projectId,
      callbackUrl,
    });
    res.status(201).json(session);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create session";
    res.status(400).json({ error: message });
  }
}

export async function verify(req: Request, res: Response): Promise<void> {
  try {
    const { token, proofData } = req.body as VerifySessionInput;
    const session = await sessionService.verifySession(token, proofData);
    res.json(session);
  } catch (err) {
    if (err instanceof sessionService.SessionError) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Verification failed" });
  }
}

export async function getByToken(req: Request, res: Response): Promise<void> {
  const session = await sessionService.getSessionByToken(req.params.token as string);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json(session);
}

export async function listForProject(req: Request, res: Response): Promise<void> {
  const { apiKey } = req as ApiKeyRequest;
  const status = req.query.status as SessionStatus | undefined;
  const sessions = await sessionService.listSessions(apiKey.projectId, status);
  res.json(sessions);
}
