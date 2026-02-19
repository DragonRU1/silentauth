import { prisma } from "./prisma";

export async function getStats() {
  const [organizations, users, projects, sessions] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count({ where: { role: { not: "SUPER_ADMIN" } } }),
    prisma.project.count(),
    prisma.actionSession.count(),
  ]);

  const [verified, pending, expired] = await Promise.all([
    prisma.actionSession.count({ where: { status: "VERIFIED" } }),
    prisma.actionSession.count({ where: { status: "PENDING" } }),
    prisma.actionSession.count({ where: { status: "EXPIRED" } }),
  ]);

  return { organizations, users, projects, sessions, verified, pending, expired };
}

export async function listOrganizations() {
  return prisma.organization.findMany({
    include: {
      _count: { select: { users: true, projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrganizationDetails(orgId: string) {
  return prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      users: { select: { id: true, email: true, role: true, createdAt: true } },
      projects: {
        include: {
          _count: { select: { actionSessions: true, apiKeys: true } },
        },
      },
    },
  });
}

export async function setOrganizationActive(orgId: string, active: boolean) {
  return prisma.organization.update({
    where: { id: orgId },
    data: { active },
  });
}

export async function listAllUsers() {
  return prisma.user.findMany({
    where: { role: { not: "SUPER_ADMIN" } },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      organization: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AdminError("User not found");
  if (user.role === "SUPER_ADMIN") throw new AdminError("Cannot delete super-admin");
  return prisma.user.delete({ where: { id: userId } });
}

export async function listAllSessions(status?: string) {
  return prisma.actionSession.findMany({
    where: status ? { status: status as "PENDING" | "VERIFIED" | "EXPIRED" } : undefined,
    include: {
      project: { select: { id: true, name: true, organization: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export class AdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminError";
  }
}
