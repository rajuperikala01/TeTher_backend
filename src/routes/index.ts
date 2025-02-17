import { Router } from "express";
import auth from "./authRoutes";
const router = Router();

router.use("/auth", auth);

export default router;
