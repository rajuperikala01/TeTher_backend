import { Router } from "express";
import auth from "./authRoutes";
import contacts from "./contactRoutes";
const router = Router();

router.use("/auth", auth);
router.use("/user", contacts);

export default router;
