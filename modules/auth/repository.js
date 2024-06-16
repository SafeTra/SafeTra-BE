const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { generateToken, verificationToken } = require('../../config/jwtToken');
const { generateRefreshToken } = require('../../config/refreshToken');
const { sendEmail, loadTemplate } = require('../../helpers/emailHelper');
const { ROLES } = require('../users/enums');
const { FORGOT_PASSWORD, forgotPasswordValues } = require('../../helpers/mail_templates/forgotPassword');
const { emailVerificationValues } = require('../../helpers/mail_templates/emailVerification');
const { pageRoutes } = require('../../lib/pageRoutes');
const { User, Profile, Kyc } = require('../users/models');
const { EMAIL_VERIFICATION_MAIL } = require('../../helpers/mail_templates/emailVerification');
const { EMAIL_SUBJECTS } = require('../../helpers/enums');
const { ZEPTO_CREDENTIALS, FE_BASE_URL } = require('../../config/env');




const userCreation = async (username, email, password) => {
    try {
        // Check for uniqueness via Email and Username
        const findUserByEmail = await User.findOne({ email });
        const findUserByUsername = await User.findOne({ username });
    
        if (!findUserByEmail && !findUserByUsername) {
          const newUser = await User.create({   // New user
            username,
            email,
            password,
          });
    
          const newUserProfile = await Profile.create({    // New profile for new user 
            user_id: newUser._id,
          })
    
          const newUserKyc = await Kyc.create({   // New Kyc for new user
            user_id: newUser._id,
            user_profile_id: newUserProfile._id,
          })
    
          // Generating verification link
          const token = verificationToken(newUser._id, newUser.role, email)
          const verificationLink = `${FE_BASE_URL}${pageRoutes.auth.confirmEmail}?username=${username}&token=${token}`;
          
          // Gerating email 
          const templateValues = emailVerificationValues(verificationLink)
          const loadedTemplate = loadTemplate(EMAIL_VERIFICATION_MAIL, templateValues);
          
          // Sending verification mail
          sendEmail(
            ZEPTO_CREDENTIALS.noReply,
            EMAIL_SUBJECTS.EMAIL_VERIFICATION,
            loadedTemplate,
            {
              email: email
            }
          );
          
          const newUserData = JSON.parse(newUser);
            newUserData.profile = JSON.parse(newUserProfile);
            newUserData.kyc = JSON.parse(newUserKyc);
    
          console.log(`${username} created, verification link sent to ${email}`);  // For logs
          return {
            code: 200,
            status: "Success",
            message: 'User created Successfully, verification link sent!'
            // data: 
          };
    
        } else if (findUserByEmail) {
          console.log(`${email} already exists`);   // For logs
          return {
            code: 409,
            status: "Failure",
            error: 'Email already exists!' 
          };
        } else if (findUserByUsername) {
          console.log(`${username} already exists`);   // For logs
          return {
            code: 409,
            status: "Failure",
            error: 'Username already exists!' 
          };
        }
    } catch (error) {
        console.log(`Error creating user ${username}`);   // For logs
        return {
            code: 500,
            status: 'Failure', 
            error: 'Error creating user'
        };
    }
};

module.exports = {
    userCreation,
}