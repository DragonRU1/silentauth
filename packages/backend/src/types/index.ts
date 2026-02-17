import { Request } from "express";
import { z } from "zod";

// ── Request Schemas ──────────────────────────────────────────────
export const CreateOrgSchema = z.object({
  name: z.string().min(1).max(255),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
});

export const CreateSessionSchema = z.object({
  callbackUrl: z.string().url().optional(),
});

export const VerifySessionSchema = z.object({
  token: z.string().min(1),
  proofData: z.record(z.unknown()).optional(),
});

// ── Derived Types ────────────────────────────────────────────────
export type CreateOrgInput = z.infer<typeof CreateOrgSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type VerifySessionInput = z.infer<typeof VerifySessionSchema>;

// ── Auth Types ───────────────────────────────────────────────────
export interface JwtPayload {
  userId: string;
  orgId: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

export interface ApiKeyRequest extends Request {
  apiKey: {
    id: string;
    projectId: string;
    scopes: string[];
  };
}
