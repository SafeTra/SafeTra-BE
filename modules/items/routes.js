const express = require("express");
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");

const { validateRegisterUserRequest } = require("../../helpers/validators");
const { 
    getItems, 
    getItem, 
    createItem, 
    updateItem, 
    deleteItem 
} = require("./contollers");


const itemRouter = express.Router();
const route = '/items';

itemRouter.get("/", authMiddleware,  getItems);
itemRouter.get("/:id", authMiddleware, getItem);
itemRouter.post("/", authMiddleware, createItem);
itemRouter.patch("/:id", authMiddleware, updateItem);
itemRouter.delete("/:id", authMiddleware,  deleteItem);

module.exports = {
    itemRouter,
    route,
};