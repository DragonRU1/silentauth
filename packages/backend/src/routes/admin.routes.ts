import { Router } from "express";
import { requireSuperAdmin } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { UpdateOrgStatusSchema } from "../types";
import * as adminController from "../controllers/admin.controller";

const router = Router();

router.use(requireSuperAdmin);

router.get("/stats", adminController.stats);
router.get("/organizations", adminController.listOrganizations);
router.get("/organizations/:id", adminController.getOrganization);
router.patch("/organizations/:id", validate(UpdateOrgStatusSchema), adminController.updateOrganizationStatus);
router.get("/users", adminController.listUsers);
router.delete("/users/:id", adminController.deleteUser);
router.get("/sessions", adminController.listSessions);

export default router;
