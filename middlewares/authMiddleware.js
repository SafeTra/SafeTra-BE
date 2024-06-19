const { User } = require("../modules/users/models");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { ROLES } = require("../modules/users/enums");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  //console.log(req.headers.authorization)
  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        req.user = user;
        req.user_id = decoded.id;
        next();
      }
    } catch (error) {
      return res.status(400).json({ error: 'Token Expired, please Login again' });
    }
  } else {
    return res.status(400).json({ error: 'Unauthorized'});
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];
  const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
  if (decodedUser.role !== ROLES.ADMIN) {
    return res.status(400).json({ error: 'Unauthorized' });
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin };
