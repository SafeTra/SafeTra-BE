const express = require("express");
const {
  createUser,
  updateUser,
  createAdmin,
  getAllUsers,
  getAllAdmins,
  getaSingleUser,
  loginUser,
  logout,
  handleRefreshToken,
  deleteaUser,
  updatePassword,
  resetPassword,
  forgotPasswordToken,
  verifyOtp,
  verifyEmail,
  sendVerificationEmail,
  validateEmail,
} = require("../controllers/userCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const { validateLoginRequest, validateRegisterUserRequest } = require("../helpers/validators");
const router = express.Router();

router.post("/register", validateRegisterUserRequest, createUser );
router.post("/register-admin", authMiddleware, validateRegisterUserRequest, isAdmin, createAdmin );
router.get("/all-users", authMiddleware, isAdmin, getAllUsers);
router.get("/all-admins", authMiddleware, isAdmin, getAllAdmins);
router.post("/login",validateLoginRequest ,loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/verify-email", verifyEmail);
router.post("/validate-email", validateEmail);
router.post("/send-email-verification", sendVerificationEmail);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/:id", authMiddleware, getaSingleUser);
router.patch("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, isAdmin, deleteaUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.post("/reset-password/:token", resetPassword);
router.put("/update-Password", authMiddleware, isAdmin, updatePassword);

module.exports = router;
