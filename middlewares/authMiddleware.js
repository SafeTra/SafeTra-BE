const User = require ('../models/userModel')
const asyncHandler = require ('express-async-handler')
const jwt = require ('jsonwebtoken');



const isAdmin = asyncHandler (async (req, res, next) => {
    if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const {email} = req.user;
    console.log(req.user);
    const adminUser = await User.findOne({email});
    if (adminUser.role !== 'admin'){
        throw new Error ('you are not an admin');
    }else{
        next();
    }
});


module.exports = isAdmin;