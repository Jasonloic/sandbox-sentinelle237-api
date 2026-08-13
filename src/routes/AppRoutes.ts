import { Router } from "express";
import { UserRoutes } from "./UserRoutes";
import { AuthRoutes } from "./AuthRoutes";
import { TotpRoutes } from "./TotpRoutes";
import { FluxRoutes } from "./FluxRoutes";
import { AlerteRoutes } from "./AlerteRoutes";
import { DossierRoutes } from "./DossierRoutes";
import { CategorieFluxRoutes } from "./CategorieFluxRoutes";
import { DashboardRoutes } from "./DashboardRoutes";
import { ArticleRoutes } from "./ArticleRoutes";
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
router.use("/dashboard", authMiddleware.verifyToken, DashboardRoutes);
router.use("/articles", authMiddleware.verifyToken, ArticleRoutes);

export { router as AppRoutes };