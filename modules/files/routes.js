const express = require("express");
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");

const { validateRegisterUserRequest } = require("../../helpers/validators");
const {
    getFiles,
    getFile,
    uploadFile,
    updateFile,
    deleteFile
} = require("./contollers");


const fileRouter = express.Router();
const route = '/files';

fileRouter.get("/", authMiddleware,  getFiles);
fileRouter.get("/:id", authMiddleware, getFile);
fileRouter.post("/", authMiddleware, uploadFile);
fileRouter.patch("/:id", authMiddleware, updateFile);
fileRouter.delete("/:id", authMiddleware,  deleteFile);

module.exports = {
    fileRouter,
    route,
};