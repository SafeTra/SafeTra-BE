const express = require("express");

const { isAdmin, authMiddleware } = require("../../middlewares/authMiddleware");
const { validateLoginRequest, validateRegisterUserRequest } = require("../../helpers/validators");
const { 
  createUser, 
  loginUser, 
  verifyOtp, 
  verifyEmail, 
  validateEmail, 
  sendVerificationEmail, 
  handleRefreshToken, 
  logout, 
  forgotPasswordToken, 
  resetPassword, 
  createAdmin 
} = require("./contollers");

const authRouter = express.Router();
const route = '/auth';

authRouter.post("/register", validateRegisterUserRequest, createUser );
authRouter.post("/register-admin", authMiddleware, validateRegisterUserRequest, isAdmin, createAdmin );
authRouter.post("/login",validateLoginRequest ,loginUser);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/validate-email", validateEmail);
authRouter.post("/send-email-verification", sendVerificationEmail);
authRouter.get("/refresh", handleRefreshToken);
authRouter.get("/logout", logout);
authRouter.post("/forgot-password-token", forgotPasswordToken);
authRouter.post("/reset-password/:token", resetPassword);


module.exports = {
  authRouter,
  route,
};