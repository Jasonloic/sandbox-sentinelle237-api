import { Router } from "express";
import AuthController from "../controllers/AuthController";
import ValidateRequest from "../middlewares/ValidateRequest";
import { loginLimiter, registerLimiter } from "../middlewares/RateLimiter";
import {
    loginUserSchema,
    registerUserSchema,
    verifyTotpLoginSchema,
    resendVerificationSchema,
} from "../validations/UserValidations";

const router = Router();
const authController = new AuthController();

router
    .post(
        "/register",
        registerLimiter,
        ValidateRequest(registerUserSchema),
        authController.register.bind(authController)
    )
    .get("/verify-email", authController.verifyEmail.bind(authController))
    .post(
        "/resend-verification",
        ValidateRequest(resendVerificationSchema),
        authController.resendVerification.bind(authController)
    )
    .post(
        "/login",
        loginLimiter,
        ValidateRequest(loginUserSchema),
        authController.login.bind(authController)
    )
    .post(
        "/login/totp",
        loginLimiter,
        ValidateRequest(verifyTotpLoginSchema),
        authController.verifyTotpLogin.bind(authController)
    )
    .post("/refresh", authController.refresh.bind(authController))
    .post("/logout", authController.logout.bind(authController));

export { router as AuthRoutes };