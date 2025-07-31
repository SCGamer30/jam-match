import { Router } from "express";
import usersRoutes from "./users";
import matchingRoutes from "./matching";
import bandsRoutes from "./bands";
import chatRoutes from "./chat";

const router = Router();

// Mount route modules
router.use("/users", usersRoutes);
router.use("/bands", bandsRoutes);
router.use("/chat", chatRoutes);
router.use("/", matchingRoutes);

export default router;
