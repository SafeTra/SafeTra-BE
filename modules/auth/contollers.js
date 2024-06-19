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
const { ZEPTO_CREDENTIALS, FE_BASE_URL, JWT_SECRET } = require('../../config/env');
const { kyc_checker } = require('../users/contollers');
const { validateMongodbid } = require('../../util/validateMongodbid');





const getCurrentUser = asyncHandler(async (req, res) => {
  const id = req.user_id;
  console.log(id)
  validateMongodbid(id);
  try {
    const sample = await User.findById(id)
    const getSingleUser = await User.findById(   // FindById removes is_active for some reason
      id,
      {password:false, otp:false},
    ).populate("profile").populate("kyc");
    
    if (!getSingleUser) {
      return res.status(404).json({ 
        status: 'Failure',
        message: 'User not found',
      });
    }else if (getSingleUser && !getSingleUser.is_active) {
      return res.status(400).json({ 
        status: 'Failure',
        message: 'User deactivated',
      });
    }

    const onboardingStatus = await getSingleUser.kyc_checker();
    
    return res.status(200).json({ 
      status: 'Success',
      message: 'User details fetched successfully', 
      data: getSingleUser,
      kyc_completed: onboardingStatus,
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'Failure',
      message: 'Error Fetching user',
    });
  }
});


const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  
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

      const newUserData = await User.findByIdAndUpdate(newUser._id,
        {
          profile: newUserProfile._id,
          kyc: newUserKyc._id
        },
        {new: true, runValidators: true},
        {password: false}
      ).populate("profile").populate("kyc").select("-password");

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

      const onboardingStatus = await newUserData.kyc_checker();
      console.log(`${username} created, verification link sent to ${email}`);  // For logs
      return res.status(201).json({ 
        status: "Success",
        message: 'User created Successfully, verification link sent!',
        data: newUserData,
        kyc_completed: onboardingStatus,
      });

    } else if (findUserByEmail) {
      console.log(`${email} already exists`);   // For logs
      return res.status(409).json({ 
        status: "Failure",
        error: 'Email already exists!' 
      });
    } else if (findUserByUsername) {
      console.log(`${username} already exists`);   // For logs
      return res.status(409).json({ 
        status: "Failure",
        error: 'Username already exists!' 
      });
    }
  } catch (error) {
    console.log(error);
    console.log(`Error creating user ${username}`);   // For logs
    res.status(500).json({
      status: 'Failure', 
      error: 'Error creating user'
    });
  }
});




const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    const userKyc = await Kyc.findOne({ user_id: decoded.id});

    if (!user && !userKyc) {
      return res.status(403).json({
        status: 'Failure', 
        error: 'Invalid token'
      }); 
    }

    // Verify email via kyc
    userKyc.is_email_verified = true; 
    await userKyc.save();


    const userData = await User.findById(decoded.id, {password: false}).populate("profile").populate("kyc");
    const onboardingStatus = await userData.kyc_checker();
    console.log(`${user.email} verified successfully.`);    // For logs
    return res.status(200).json({
      status: 'Success', 
      message: 'Email verified successfully.',
      kyc_completed: onboardingStatus,
      data: userData 
    });

    // Todo: Blacklist token
  
  } catch (error) {
    if (error.name === 'TokenExpiredError') {    // Requires a resend of token
      console.log('TokenExpiredError');   // For logs
      return res.status(400).json({
        status: 'Failure', 
        error: 'Token expired'
      });
    } 
    else if (error.name === 'JsonWebTokenError') {     // Encrypted with foreign secret
      console.log('Invalid email verification token');  // For logs
      return res.status(403).json({
        status: 'Failure', 
        error: 'Invalid token'
      }); 
    }
    else {
      console.log('Error verifying email');    // For logs
      return res.status(500).json({
        status: 'Failure', 
        error: 'Error verifying email' 
      }); 
    }
  }
});



const validateEmail = asyncHandler( async (req, res) => {
  const { email } = req.body;

  try {
    // Get user and user's kyc
    const user = await User.findOne({ email });
    const userKyc = await Kyc.findOne({ user_id: user._id });

    if(!user && !userKyc) {
      console.log(`Couldn't validate ${email}, user not found!`);   // For logs
      return res.status(404).json({
        status: 'Failure', 
        error: 'User not found' 
      }); 
    }

    // Verify email via kyc
    userKyc.is_email_verified = true;
    await user.save();

    const userData = await User.findById(user._id, {password: false}).populate("profile").populate("kyc")
    console.log(`${user.email} validated successfully!`);   // For logs
    const onboardingStatus = await userData.kyc_checker(); 

    return res.status(200).json({
      status: 'Success', 
      message: 'Email validated successfully',
      kyc_completed: onboardingStatus,
      data: userData
    });
    
  } catch (error) {

    console.log(`${email} validation failed!`);   // For logs
    return res.status(500).json({
      status: 'Failure', 
      message: 'Error validating email'
    });

  };
});




const sendVerificationEmail = asyncHandler(async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      console.log('User not found');
      return res.status(404).json({
        status: 'Failure', 
        error: 'User not found'
      }); 
    }

    // Generating verification link
    const token = verificationToken(user._id, user.role, user.email);
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
        email: user.email
      }
    );

    console.log(`Email verification sent to ${user.email}`);    // For logs
    return res.status(200).json({
      status: 'Success', 
      message: 'Email verification sent.' 
    });
  
  } catch (error) {

    console.log(`Error resending verification to ${username}`);    // For logs
    return res.status(500).json({
      status: 'Failure', 
      error: 'Error resending verification'
    });

  }

});



// For mobile verification
const verifyOtp = asyncHandler( async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await User.findOne({ otp });

    if(!user) {
      throw new Error ('Invalid Otp')
    }

    user.is_emailVerified = true;
    await user.save();

    res.json({ message: 'OTP verified successfully' });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  };
});



const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email: email.toLowerCase() });

  if (!findUser) {
    console.log(`${email} not found`);   // For logs
    return res.status(404).json({
      status: 'Failure', 
      error: 'User not found'
    }); 
  }

  if (findUser && !findUser.is_active) {
    console.log(`${email} has been deactivated`);   // For logs
    return res.status(400).json({
      status: 'Failure', 
      error: 'User has been deactivated'
    }); 
  }


  if (await findUser.isPasswordsMatched(password)) {
    const refreshToken = generateRefreshToken(findUser._id);
    await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, 
      maxAge: 72 * 60 * 60 * 1000,
    });

    console.log(`${findUser.email} logged in successfully!`)
    const userData = await User.findById(findUser._id, {password: false}).populate("profile").populate("kyc");
    const onboardingStatus = await userData.kyc_checker();

    return res.status(200).json({
      status: 'Success',
      message: 'Login successful',
      data: userData,
      kyc_completed: onboardingStatus,
      token: generateToken(findUser._id, findUser.role),
    });
  } else {
    console.log(`${email} login failed`);
    return res.status(403).json({
      status: 'Failure', 
      error: 'Invalid Credentials' 
    });
  }
});




const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie.refreshToken) {
    console.log(`No token in cookies`);
    return res.status(400).json({
      status: 'Failure', 
      error: 'No token in cookies' 
    });
  }

  const refreshToken = cookie.refreshToken;
  
  const user = await User.findOne({ 
    refreshToken 
  });

  if (!user) {
    console.log(`No refresh token present in db or not matched`);
    return res.status(400).json({
      status: 'Failure', 
      error: 'No refresh token present in db or not matched' 
    });
  }


  if (user && !user.is_active) {
    console.log(`${email} has been deactivated`);   // For logs
    return res.status(400).json({
      status: 'Failure', 
      error: 'User has been deactivated'
    }); 
  }
  
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      console.log(`Invalid refresh token`);
      return res.status(500).json({
        status: 'Failure', 
        error: 'Invalid refresh token' 
      });
    }
    const accessToken = generateToken(user?._id, user?.role);
    console.log(`Generated access token for ${user?._id} successfully`);
    return res.status(200).json({
      status: 'Success',
      message: 'Generated access token successfully', 
      accessToken: accessToken
    });
  });

});




const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error('No refresh token in cookies');
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }
  await User.findByIdAndUpdate(
    { refreshToken: refreshToken },
    {
      refreshToken: '',
    }
  );
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204);
});




const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    console.log(`${email} not found`);   // For logs
    return res.status(404).json({
      status: 'Failure',
      error: 'User not found' 
    });
  }

  if (user && !user.is_active) {
    console.log(`${email} has been deactivated`);   // For logs
    return res.status(400).json({
      status: 'Failure', 
      error: 'User has been deactivated'
    }); 
  }
  
  try {
    // Generating verification link
    const token = await user.createPasswordResetToken();  // Find way to make user not an unknown
    await user.save();

    const resetUrl = `${FE_BASE_URL}${pageRoutes.auth.resetPassword}?token=${token}`;

    // Gerating email 
    const templateValues = forgotPasswordValues(resetUrl)
    const loadedTemplate = loadTemplate(FORGOT_PASSWORD, templateValues);

    // Sending verification mail
    sendEmail(
      ZEPTO_CREDENTIALS.noReply,
      EMAIL_SUBJECTS.FORGOT_PASSWORD,
      loadedTemplate,
      {
        email: email,
        firstName: user.firstname,
        firstName: user.lastname,
      }
    );

    console.log(`Password reset link sent to ${email}`);   // For logs
    return res.status(200).json({
      status: 'Success',
      message: 'Password reset email sent!',
    });
  } catch (error) {

    console.log(`Error sending password reset link to ${email}`);    // For logs
    return res.status(500).json({
      status: 'Failure',
      error: 'Error sending password reset email' 
    });

  }
});



const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id, {password:false, otp:false});
    
    if (!user) {
      return res.status(403).json({
        status: 'Failure', 
        error: 'Invalid token'
      }); 
    }
    
    if (user && !user.is_active) {
      console.log(`${email} has been deactivated`);   // For logs
      return res.status(400).json({
        status: 'Failure', 
        error: 'User has been deactivated'
      }); 
    }


    if (password) {
      user.password = password;
      user.password_reset_token = null; // Might not be neccessary
      user.password_reset_expires = null;
      
      await user.save();
      
      // Todo: Find better way to remove password from response data
      const updatedUser = await User.findById(decoded.id, {password:false, otp:false}).populate("profile").populate("kyc");
      const onboardingStatus = await updatedUser.kyc_checker();
      console.log(`${user.username} password reset successful`);    //For logs
      return res.status(200).json({ 
        status: 'Success',
        message: 'Password reset successful', 
        data: updatedUser,
        kyc_completed: onboardingStatus,
      });
    } else { 
      console.log(`Password not provided for <${id}>`);    // For logs
      return res.status(400).json({ 
        status: 'Failure',
        error: 'Password not provided'
      });
    }

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('TokenExpiredError');   // For logs
      return res.status(400).json({
        status: 'Failure', 
        error: 'Token expired'
      });
    } 
    else if (error.name === 'JsonWebTokenError') {
      console.log('Invalid password reset token');    // For logs
      return res.status(403).json({
        status: 'Failure', 
        error: 'Invalid token'
      }); 
    }
    else {
      console.log(`Error updating password`);    // For logs
      return res.status(500).json({
        status: 'Failure', 
        error: 'Error updating password' 
      }); 
    }
  }
});


module.exports = {
  getCurrentUser,
  registerUser,
  loginUser,
  verifyOtp,
  verifyEmail,
  sendVerificationEmail,
  validateEmail,
  logout,
  handleRefreshToken,
  forgotPasswordToken,
  resetPassword,
};
