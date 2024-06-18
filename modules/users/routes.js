const express = require("express");
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");
const { 
    getAllUsers, 
    getAllAdmins,
    updateUser, 
    deactivateUser,
    getUser,
    activateUser,
    getAdmin,
    updateAdmin,
    createUser,
} = require("./contollers");
const { validateRegisterUserRequest } = require("../../helpers/validators");

const userRouter = express.Router();
const route = '/users';

userRouter.get("/", authMiddleware, isAdmin, getAllUsers);
userRouter.post("/", authMiddleware, validateRegisterUserRequest, isAdmin, createUser);
userRouter.get("/admins", authMiddleware, isAdmin, getAllAdmins);
userRouter.get("/admins/:id", authMiddleware, isAdmin, getAdmin);
userRouter.patch("/admins/:id", authMiddleware, isAdmin, updateAdmin);
userRouter.get("/:id", authMiddleware, getUser);
userRouter.patch("/:id", authMiddleware, updateUser);
userRouter.patch("/:id/activate", authMiddleware, isAdmin, activateUser);
userRouter.delete("/:id", authMiddleware, isAdmin, deactivateUser);

module.exports = {
    userRouter,
    route,
};