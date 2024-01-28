const User = require("../models/userModel");
const asyncHandler = require ('express-async-handler');
const { validateMongodbid } = require("../util/validateMongodbid");



const createUser = asyncHandler (async ( req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email});
    if (!findUser) {
        const newUser = await User.create(req.body);
        res.json(newUser);
    }else{
        throw new Error('user already exists');
    }
});

const getAllUsers = asyncHandler (async (req,res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    } catch (error) {
        throw new Error (error);
    }
});

const getaSingleUser = asyncHandler (async ( req, res) => {
    const {id} = req.params;
    validateMongodbid(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        });
    } catch (error) {
        throw new Error (error);
    }
})

module.exports = { 
    createUser,
    getAllUsers,
    getaSingleUser
};