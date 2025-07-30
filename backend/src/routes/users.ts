import { Router } from "express";
import profileRoutes from "./profile";

const router = Router();

// Mount profile routes under /users
router.use("/", profileRoutes);

export default router;
