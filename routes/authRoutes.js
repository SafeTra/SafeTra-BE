const express = require("express");
const {
  createUser,
  getAllUsers,
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
} = require("../controllers/userCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const { validateLoginRequest, validateRegisterUserRequest } = require("../helpers/validators");
const router = express.Router();

router.post("/register", validateRegisterUserRequest,createUser );
router.get("/all-users", getAllUsers);
router.post("/login",validateLoginRequest ,loginUser);
router.post("/verify-otp", verifyOtp);
router.get("/verify-email", verifyEmail);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/:id", authMiddleware, isAdmin, getaSingleUser);
router.delete("/:id", deleteaUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put("/update-Password", authMiddleware, updatePassword);

module.exports = router;
