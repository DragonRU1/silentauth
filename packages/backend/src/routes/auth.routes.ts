import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middleware/validate";
import { CreateOrgSchema, LoginSchema } from "../types";

const router = Router();

router.post("/register", validate(CreateOrgSchema), authController.register);
router.post("/login", validate(LoginSchema), authController.login);

export default router;
