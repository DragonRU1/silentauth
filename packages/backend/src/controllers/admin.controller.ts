import { Request, Response } from "express";
import * as adminService from "../services/admin.service";
import type { UpdateOrgStatusInput } from "../types";

export async function stats(_req: Request, res: Response) {
  try {
    const data = await adminService.getStats();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}

export async function listOrganizations(_req: Request, res: Response) {
  try {
    const orgs = await adminService.listOrganizations();
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
}

export async function getOrganization(req: Request, res: Response) {
  try {
    const org = await adminService.getOrganizationDetails(req.params.id);
    if (!org) {
      res.status(404).json({ error: "Organization not found" });
      return;
    }
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch organization" });
  }
}

export async function updateOrganizationStatus(req: Request, res: Response) {
  try {
    const { active } = req.body as UpdateOrgStatusInput;
    const org = await adminService.setOrganizationActive(req.params.id, active);
    res.json(org);
  } catch (err) {
    res.status(500).json({ error: "Failed to update organization" });
  }
}

export async function listUsers(_req: Request, res: Response) {
  try {
    const users = await adminService.listAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    await adminService.deleteUser(req.params.id);
    res.json({ success: true });
  } catch (err) {
    if (err instanceof adminService.AdminError) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Failed to delete user" });
  }
}

export async function listSessions(req: Request, res: Response) {
  try {
    const status = req.query.status as string | undefined;
    const sessions = await adminService.listAllSessions(status);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
}
