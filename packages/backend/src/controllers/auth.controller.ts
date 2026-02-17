import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import type { CreateOrgInput, LoginInput } from "../types";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.registerOrganization(req.body as CreateOrgInput);
    res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    res.status(400).json({ error: message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.login(req.body as LoginInput);
    res.json(result);
  } catch (err) {
    if (err instanceof authService.AuthError) {
      res.status(401).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: "Login failed" });
  }
}
