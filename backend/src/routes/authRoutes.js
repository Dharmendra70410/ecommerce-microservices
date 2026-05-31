import { Router } from "express";
import {
  adminDashboard,
  forgotPassword,
  listUsers,
  login,
  profile,
  register,
  resetPassword,
  signup,
  resendVerificationEmail,
  verifyEmail
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
  validateLoginRequest,
  validateRegisterRequest,
  validateResetPasswordRequest
} from "../middleware/validateRequest.js";

const router = Router();

router.post("/register", validateRegisterRequest, register);
router.post("/signup", validateRegisterRequest, signup);
router.post("/login", validateLoginRequest, login);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendVerificationEmail);
router.post("/resend-verification-otp", resendVerificationEmail);
router.post("/resend-email-otp", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", validateResetPasswordRequest, resetPassword);
router.get("/profile", authMiddleware, profile);
router.get("/admin/dashboard", authMiddleware, adminMiddleware, adminDashboard);
router.get("/admin/users", authMiddleware, adminMiddleware, listUsers);

export default router;
