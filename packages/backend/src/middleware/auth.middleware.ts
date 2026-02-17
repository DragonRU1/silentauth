import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth.service";
import { resolveApiKey } from "../services/project.service";
import type { AuthenticatedRequest, ApiKeyRequest } from "../types";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  try {
    const payload = verifyToken(header.slice(7));
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export async function requireApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers["x-api-key"];
  if (typeof header !== "string") {
    res.status(401).json({ error: "Missing X-API-Key header" });
    return;
  }

  const apiKey = await resolveApiKey(header);
  if (!apiKey) {
    res.status(401).json({ error: "Invalid API key" });
    return;
  }

  (req as ApiKeyRequest).apiKey = {
    id: apiKey.id,
    projectId: apiKey.projectId,
    scopes: apiKey.scopes,
  };
  next();
}
