const express = require("express");
const { authMiddleware, isAdmin } = require("../../middlewares/authMiddleware");
const { generateLink, validateLink } = require("./contollers");


const referralRouter = express.Router();
const route = '/referrals';

referralRouter.get("/generate-url", authMiddleware, generateLink);

referralRouter.post('/validate', validateLink )


module.exports = {
    referralRouter,
    route
}
