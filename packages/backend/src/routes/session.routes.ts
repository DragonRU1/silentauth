import { Router } from "express";
import * as sessionController from "../controllers/session.controller";
import { requireApiKey } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { CreateSessionSchema, VerifySessionSchema } from "../types";

const router = Router();

// Public: verify a session (used by verification-client)
router.post("/verify", validate(VerifySessionSchema), sessionController.verify);

// Public: check session status by token
router.get("/:token", sessionController.getByToken);

// API-key protected routes
router.post("/", requireApiKey, validate(CreateSessionSchema), sessionController.create);
router.get("/", requireApiKey, sessionController.listForProject);

export default router;
