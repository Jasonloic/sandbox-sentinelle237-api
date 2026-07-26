import { Router } from "express";
import { UserRoutes } from "./UserRoutes";
import { AuthRoutes } from "./AuthRoutes";
import { TotpRoutes } from "./TotpRoutes";
import Auth from "../middlewares/Auth";

const router = Router();
const authMiddleware = new Auth();

router.use("/auth", AuthRoutes);
router.use("/users", authMiddleware.verifyToken, UserRoutes);
router.use("/totp", authMiddleware.verifyToken, TotpRoutes);

export { router as AppRoutes };