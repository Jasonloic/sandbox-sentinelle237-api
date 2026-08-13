import { Router } from "express";
import { UserRoutes } from "./UserRoutes";
import { AuthRoutes } from "./AuthRoutes";
import { TotpRoutes } from "./TotpRoutes";
import { FluxRoutes } from "./FluxRoutes";
import { AlerteRoutes } from "./AlerteRoutes";
import { DossierRoutes } from "./DossierRoutes";
import { CategorieFluxRoutes } from "./CategorieFluxRoutes";
import Auth from "../middlewares/Auth";

const router = Router();
const authMiddleware = new Auth();

router.use("/auth", AuthRoutes);
router.use("/users", authMiddleware.verifyToken, UserRoutes);
router.use("/totp", authMiddleware.verifyToken, TotpRoutes);
router.use("/flux", authMiddleware.verifyToken, FluxRoutes);
router.use("/categories-flux", authMiddleware.verifyToken, CategorieFluxRoutes);
router.use("/alertes", authMiddleware.verifyToken, AlerteRoutes);
router.use("/dossiers", authMiddleware.verifyToken, DossierRoutes);

export { router as AppRoutes };