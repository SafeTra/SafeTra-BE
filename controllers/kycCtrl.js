const User = require ('../models/userModel');
const asyncHandler = require ('express-async-handler');
const { validateMongodbid } = require('../util/validateMongodbid');




const handleKYC = asyncHandler (async (req, res) => {
    const {_id}= req.user;
    validateMongodbid(_id);

    if (!req.file) {
        throw new Error('No file Uploaded');
    };

    try {
        const kyc = await User.findByIdAndUpdate(
            _id,
            {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                address: req.body.address,
                photo: req.file.filename,
            },
            {
                new: true,
            }
        );
        res.json({ kyc });
    } catch (error) {
        throw new Error ('Error Updating KYC');
    }

   
});


module.exports = {handleKYC};