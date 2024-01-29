const User = require("../models/userModel");
const asyncHandler = require ('express-async-handler');
const { validateMongodbid } = require("../util/validateMongodbid");
const crypto = require ('crypto');
const jwt = require ('jsonwebtoken');
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");


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

const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    const findUser = await User.findOne({email});
    if (findUser && (await findUser.isPasswordsMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser._id)
        const updateuser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            {new: true},
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            _id: findUser._id,
            name: findUser.name,
            mobile: findUser.mobile,
            token: generateToken(findUser._id),
        });
    }else{
        throw new Error ('invalid credentials');
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
    getaSingleUser,
    loginUser
};