import { Router } from "express";
import usersRoutes from "./users";

const router = Router();

// Mount route modules
router.use("/users", usersRoutes);

export default router;
