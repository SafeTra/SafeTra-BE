const User = require ('../models/userModel');
const asyncHandler = require ('express-async-handler');
const { validateMongodbid } = require('../util/validateMongodbid');
const kyc = require('../models/kycModel');
const { VERIFICATION_TYPE } = require('./enum');



// const handleKYC = asyncHandler (async (req, res) => {
//     const {_id }= req.user;
//     validateMongodbid(_id);
//     console.log(_id);
//     if (!req.file) {
//         throw new Error('No file Uploaded');
//     };

//     try {
//         const kyc = await User.findByIdAndUpdate(
//             _id,
//             {
//                 firstname: req.body.firstname,
//                 lastname: req.body.lastname,
//                 address: req.body.address,
//                 photo: req.file.filename,
//             },
//             {
//                 new: true,
//             }
//         );
//         res.json({ kyc });
//     } catch (error) {
//         console.log(error)
//         throw new Error ('Error Updating KYC');
//     }

   
// });


const validateIdDocument = async (documentId, idType, userId) => {
    /*
        Todo:
        Find user's KYC instance:
        const getKyc = await kyc.findOne({ customer: _id });

        Send validation credentials to third party
        for idType validation.

        userKyc's isIdVerified will be set to true on successful 
        validation. 
        
        Verification response details will be stored in idCredentials.
    */
   
};


const generateVerificationEmail = async (_id) => {
    /*
        Todo:
        - Find user instance and retrieve email
        - Send verification email with link to verification page on FE (or OTP). 
    */

};


const validateEmail = async (token, userId) => {
    /*
        Todo:
        - Verify token (with third-party if necessary)
        - Set userKyc's isEmailVerified to true on successful 
          verification. 
    */

};


const genrateMobileOtp = async (userId) => {
    /*
        Todo:
        - Find user instance and retrieve mobile number
        - Send OTP to number via third-party.
    */
};


const validateMobile = async (token, userId) => {
    /*
        Todo:
        - Verify OTP via third-party
        - Set user's Kyc isMobileVerified to true on successful 
          OTP verification via third-party. 
    */
};


const kycVerification = asyncHandler (async (req, res) => {
    const  { verificationType, document } = req.body;
    const {_id }= req.user;
    validateMongodbid(_id);  // Might not be necessary
    
    // Detect KYC field to be validated 
    // and run respective callbacks
    if (verificationType === VERIFICATION_TYPE.EMAIL) {
        try {
            generateVerificationEmail(_id);
        } catch (error) {
            res.status(400).json({
                message: "Failure",
                error: "Error genrating verification OTP/email"
            })
        }
    }
            
    if (mobile) {
        try {
            genrateMobileOtp(_id);
        } catch (error) {
            res.status(400).json({
                message: "Failure",
                error: "Error genrating verification OTP"
            })
        }
    }

    if (document) {
        try {
            validateIdDocument(document.documentId, document.documentType, _id);
        } catch (error) {
            res.status(400).json({
                message: "Failure",
                error: "Error verifying ID"
            })
        }
    }
});

const kycUpdate = asyncHandler (async (req, res) => {
    const { 
        verificationType,
        tokenData,
        // Extra details in case of asynchronous verification from third-party
    } = req.body;
    
    const {_id }= req.user;

    // Detect KYC field to be updated and run respective callbacks
    if (verificationType === VERIFICATION_TYPE.MOBILE) {
        try {
            await validateMobile(tokenData, _id)
        } catch (error) {
            res.status(400).json({
                message: "Failure",
                error: "Error verifying mobile number"
            })
        }
    }
    
    if (verificationType === VERIFICATION_TYPE.EMAIL) {
        try {
            await validateEmail(tokenData, _id)
        } catch (error) {
            res.status(400).json({
                message: "Failure",
                error: "Error verifying email address"
            })
        }
    }
    
    // This will only be of use in case of Asynchronous verification from third-party
    // if (verificationType === VERIFICATION_TYPE.EMAIL) {
    //     try {
    //         await validateMobile(_id)
    //     } catch (error) {
    //         res.status(400).json({
    //             message: "Failure",
    //             error: "Error verifying email address"
    //         })
    //     }
    // }
    
})


module.exports = {
    kycVerification,
    kycUpdate,
};