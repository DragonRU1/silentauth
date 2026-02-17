import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export async function createProject(name: string, orgId: string) {
  const project = await prisma.project.create({
    data: { name, orgId },
  });

  const rawKey = `sa_${crypto.randomBytes(32).toString("hex")}`;
  const keyHash = await bcrypt.hash(rawKey, 10);

  await prisma.apiKey.create({
    data: {
      keyHash,
      projectId: project.id,
    },
  });

  return { project, apiKey: rawKey };
}

export async function listProjects(orgId: string) {
  return prisma.project.findMany({
    where: { orgId },
    include: {
      _count: { select: { actionSessions: true, apiKeys: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectById(projectId: string, orgId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, orgId },
    include: {
      apiKeys: { select: { id: true, scopes: true, createdAt: true, revokedAt: true } },
      _count: { select: { actionSessions: true } },
    },
  });
}

export async function resolveApiKey(rawKey: string) {
  const apiKeys = await prisma.apiKey.findMany({
    where: { revokedAt: null },
  });

  for (const ak of apiKeys) {
    const match = await bcrypt.compare(rawKey, ak.keyHash);
    if (match) return ak;
  }

  return null;
}
