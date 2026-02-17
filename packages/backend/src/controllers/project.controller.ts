import { Request, Response } from "express";
import * as projectService from "../services/project.service";
import type { AuthenticatedRequest, CreateProjectInput } from "../types";

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const { name } = req.body as CreateProjectInput;
    const result = await projectService.createProject(name, user.orgId);
    res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create project";
    res.status(400).json({ error: message });
  }
}

export async function list(req: Request, res: Response): Promise<void> {
  const { user } = req as AuthenticatedRequest;
  const projects = await projectService.listProjects(user.orgId);
  res.json(projects);
}

export async function getById(req: Request, res: Response): Promise<void> {
  const { user } = req as AuthenticatedRequest;
  const project = await projectService.getProjectById(req.params.id as string, user.orgId);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(project);
}
