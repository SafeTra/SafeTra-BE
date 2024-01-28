const User = require ('../models/userModel')
const asyncHandler = require ('express-async-handler')


const isAdmin = asyncHandler (async (req, res, next) => {
    const {email} = req.user;
    const adminUser = await User.findOne({email});
    if (adminUser.role !== 'admin'){
        throw new Error ('you are not an admin');
    }else{
        next();
    }
});


module.exports = isAdmin;