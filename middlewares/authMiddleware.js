const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  //console.log(req.headers.authorization)
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded?.id);
        req.user = user;
        next();
      }
    } catch (error) {
      throw new Error("Not Authorized, Token Expired, please Login again");
    }
  } else {
    throw new Error("theres no token attached to Header");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { email } = req.user;
  console.log(req.user);
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "admin") {
    throw new Error("you are not an admin");
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin };
