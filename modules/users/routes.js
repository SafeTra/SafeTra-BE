const express = require("express");
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");
const { 
    getAllUsers, 
    getAllAdmins, 
    getaSingleUser, 
    updateUser, 
    deactivateUser
} = require("./contollers");


const userRouter = express.Router();
const userPath = '/users';

router.get("/all-users", authMiddleware, isAdmin, getAllUsers);
router.get("/all-admins", authMiddleware, isAdmin, getAllAdmins);
router.get("/:id", authMiddleware, getaSingleUser);
router.patch("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, isAdmin, deactivateUser);

module.exports = {
    userRouter,
    userPath,
};