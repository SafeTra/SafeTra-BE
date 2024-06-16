const express = require("express");

const { isAdmin, authMiddleware } = require("../../middlewares/authMiddleware");
const { validateLoginRequest, validateRegisterUserRequest } = require("../../helpers/validators");
const router = express.Router();

const authPath = '/auth';

router.post("/register", validateRegisterUserRequest, createUser );
router.post("/register-admin", authMiddleware, validateRegisterUserRequest, isAdmin, createAdmin );
router.post("/login",validateLoginRequest ,loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/verify-email", verifyEmail);
router.post("/validate-email", validateEmail);
router.post("/send-email-verification", sendVerificationEmail);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.post("/forgot-password-token", forgotPasswordToken);
router.post("/reset-password/:token", resetPassword);


module.exports = {
  authRouter,
  authPath,
};