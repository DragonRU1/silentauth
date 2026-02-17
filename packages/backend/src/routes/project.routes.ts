import { Router } from "express";
import * as projectController from "../controllers/project.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { CreateProjectSchema } from "../types";

const router = Router();

router.use(requireAuth);

router.post("/", validate(CreateProjectSchema), projectController.create);
router.get("/", projectController.list);
router.get("/:id", projectController.getById);

export default router;
