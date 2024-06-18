const express = require("express");
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");

const { validateRegisterUserRequest } = require("../../helpers/validators");

const itemRouter = express.Router();
const route = '/items';

itemRouter.get("/", authMiddleware,  getAllUsers);
itemRouter.get("/:id", authMiddleware, getUser);
itemRouter.post("/", authMiddleware, createUser);
itemRouter.patch("/:id", authMiddleware, updateUser);
itemRouter.delete("/:id", authMiddleware,  deactivateUser);

module.exports = {
    itemRouter,
    route,
};