import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import type { CreateOrgInput, LoginInput, JwtPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-secret";
const TOKEN_EXPIRY = "24h";

export async function registerOrganization(input: CreateOrgInput) {
  const passwordHash = await bcrypt.hash(input.adminPassword, 12);

  const org = await prisma.organization.create({
    data: {
      name: input.name,
      users: {
        create: {
          email: input.adminEmail,
          passwordHash,
          role: "ADMIN",
        },
      },
    },
    include: { users: true },
  });

  const user = org.users[0];
  if (!user) throw new Error("Failed to create admin user");

  const token = signToken({ userId: user.id, orgId: org.id, role: user.role });
  return { organization: { id: org.id, name: org.name }, token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AuthError("Invalid credentials");

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new AuthError("Invalid credentials");

  const token = signToken({ userId: user.id, orgId: user.orgId, role: user.role });
  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
