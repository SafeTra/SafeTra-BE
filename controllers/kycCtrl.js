const User = require ('../models/userModel');
const asyncHandler = require ('express-async-handler');
const { validateMongodbid } = require('../util/validateMongodbid');
const kyc = require('../models/kycModel');




const handleKYC = asyncHandler (async (req, res) => {
    const {_id }= req.user;
    validateMongodbid(_id);
    console.log(_id);
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
        console.log(error)
        throw new Error ('Error Updating KYC');
    }

   
});


const validateIdDocument = asyncHandler (async (documentId, idType, userKyc) => {
    /*
        Todo:
        Send validation credentials to third party
        for idType validation.

        userKyc's isIdVerified will be set to true on successful 
        validation. 
        
        Verification response details will be stored in idCredentials.
    */
   
});

const validateEmail = asyncHandler (async (emailAddress) => {
    /*
        Todo:
        Send verification email with link to verification page on FE or OTP.
    
        userKyc's isEmailVerified will be set to true on successful 
        verification. 
    */

});


const genrateMobileOtp = asyncHandler (async (mobileNumber) => {
    /*
        Todo:
        Send OTP to number via third-party.
    */
});


const validateMobile = asyncHandler (async (mobileNumber) => {
    /*
        Todo:
        userKyc's isMobileVerified will be set to true on successful 
        OTP verification via third-party. 
    */
});


const updateKYC = asyncHandler (async (req, res) => {
    const {_id }= req.user;
    validateMongodbid(_id);  // Might not be necessary

    try {
        // Find user's KYC instance

        // Detect KYC field to be validated 
        // and run respective validation callbacks
        
    } catch (error) {

    }
   
});


module.exports = {handleKYC};