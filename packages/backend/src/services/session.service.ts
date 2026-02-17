import { prisma } from "./prisma";
import type { SessionStatus, Prisma } from "@prisma/client";

const SESSION_TTL_MINUTES = 10;

export interface CreateSessionOptions {
  projectId: string;
  callbackUrl?: string;
}

export async function createSession(options: CreateSessionOptions) {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);

  return prisma.actionSession.create({
    data: {
      projectId: options.projectId,
      callbackUrl: options.callbackUrl,
      expiresAt,
    },
  });
}

export async function getSessionByToken(token: string) {
  const session = await prisma.actionSession.findUnique({ where: { token } });
  if (!session) return null;

  if (session.status === "PENDING" && session.expiresAt < new Date()) {
    return prisma.actionSession.update({
      where: { id: session.id },
      data: { status: "EXPIRED" },
    });
  }

  return session;
}

export async function verifySession(token: string, proofData?: Record<string, unknown>) {
  const session = await getSessionByToken(token);
  if (!session) throw new SessionError("Session not found");
  if (session.status === "EXPIRED") throw new SessionError("Session expired");
  if (session.status === "VERIFIED") throw new SessionError("Session already verified");

  return prisma.actionSession.update({
    where: { id: session.id },
    data: {
      status: "VERIFIED",
      proofData: (proofData ?? {}) as Prisma.InputJsonValue,
    },
  });
}

export async function listSessions(projectId: string, status?: SessionStatus) {
  return prisma.actionSession.findMany({
    where: {
      projectId,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionError";
  }
}
