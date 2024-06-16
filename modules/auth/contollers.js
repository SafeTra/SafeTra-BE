const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { generateToken, verificationToken } = require('../../config/jwtToken');
const { generateRefreshToken } = require('../../config/refreshToken');
const { sendEmail, loadTemplate } = require('../../helpers/emailHelper');
const { ROLES } = require('../../models/enums');
const { FORGOT_PASSWORD, forgotPasswordValues } = require('../../helpers/mail_templates/forgotPassword');
const { emailVerificationValues } = require('../../helpers/mail_templates/emailVerification');
const { pageRoutes } = require('../../lib/pageRoutes');
const { User, Profile, Kyc } = require('../users/models');
const { EMAIL_VERIFICATION_MAIL } = require('../../helpers/mail_templates/emailVerification');
const { EMAIL_SUBJECTS } = require('../../helpers/enums');
const { ZEPTO_CREDENTIALS } = require('../../config/env');





const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const findUserByEmail = await User.findOne({ email });
    const findUserByUsername = await User.findOne({ username });
    if (!findUserByEmail && !findUserByUsername) {
      const newUser = await User.create({
        username,
        email,
        password,
      });

      const newUserProfile = await Profile.create({
        user_id: newUser._id,
      })

      const newUserKyc = await Kyc.create({
        user_id: newUser._id,
        user_profile_id: newUserProfile._id,
      })

      const token = verificationToken(newUser._id, newUser.role, email)
      const verificationLink = `${FE_BASE_URL}${pageRoutes.auth.confirmEmail}?username=${username}&token=${token}`;

      const templateValues = emailVerificationValues(verificationLink)
      const loadedTemplate = loadTemplate(EMAIL_VERIFICATION_MAIL, templateValues);

      sendEmail(
        ZEPTO_CREDENTIALS.noReply,
        EMAIL_SUBJECTS.EMAIL_VERIFICATION,
        loadedTemplate,
        {
          email: email
        }
      );

      console.log(`${username} created, verification link sent to ${email}`);
      return res.status(201).json({ 
        status: "Success",
        message: 'User created Successfully, verification link sent!' 
      });

    } else if (findUserByEmail) {
      console.log(`${email} already exists`);
      return res.status(409).json({ 
        status: "Failure",
        error: 'Email already exists!' 
      });
    } else if (findUserByUsername) {
      console.log(`${username} already exists`);
      return res.status(409).json({ 
        status: "Failure",
        error: 'Username already exists!' 
      });
    }
  } catch (error) {
    console.log(`Error creating user ${username}`);
    res.status(500).json({
      status: 'Failure', 
      error: 'Error creating user'
    });
  }
});

const createAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const findAdminByEmail = await User.findOne({ email });
    const findAdminByUsername = await User.findOne({ username });

    if (!findAdminByEmail && !findAdminByUsername) {
      const otp = Math.floor(1000 + Math.random() * 9000);
      const newAdmin = await User.create({
        username,
        email,
        password,
        otp
      });

      newAdmin.role = ROLES.ADMIN;
      await newAdmin.save();
      
      // Send different type of verification link to admin email

      console.log(`Admin ${email} created successfully!`)
      return res.status(200).json({
        status: 'Success', 
        message: `Admin created successfully.` 
      });
    } else if (findAdminByEmail) {
      console.log(`Admin ${email} already exists!`)
      return res.status(409).json({
        status: 'Failure', 
        message: 'Email already exists.' 
      });
    } else {
      console.log(`Admin ${username} already exists!`)
      return res.status(409).json({
        status: 'Failure', 
        message: 'Username already exists.' 
      });
    }
  } catch (error) {
    console.log(`Error creating Admin ${email}!`)
    return res.status(200).json({
      status: 'Failure', 
      message: 'Error creating admin!' 
    });
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(403).json({
        status: 'Failure', 
        error: 'Invalid token'
      }); 
    }

    user.isEmailVerified = true;
    await user.save();

    console.log(`${user.email} verified successfully.`)
    return res.status(200).json({
      status: 'Success', 
      message: 'Email verified successfully.' 
    });

    // Todo: Blacklist token
  
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('TokenExpiredError');
      return res.status(400).json({
        status: 'Failure', 
        error: 'Token expired'
      });
    } 
    else if (error.name === 'JsonWebTokenError') {
      console.log('Invalid email verification token')
      return res.status(403).json({
        status: 'Failure', 
        error: 'Invalid token'
      }); 
    }
    else {
      console.log('Error verifying email')
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
    const user = await User.findOne({ email });

    if(!user) {
      console.log(`Couldn't validate ${email}, user not found!`)
      return res.status(404).json({
        status: 'Failure', 
        error: 'User not found' 
      }); 
    }

    user.isEmailVerified = true;
    await user.save();

    console.log(`${user.email} validated successfully!`)
    return res.status(200).json({
      status: 'Success', 
      message: 'Email validated successfully' 
    });
    
  } catch (error) {

    console.log(`${email} validation failed!`)
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

    const token = verificationToken(user._id, user.role, user.email);
    const verificationLink = `${FE_BASE_URL}${pageRoutes.auth.confirmEmail}?username=${username}&token=${token}`;

    const templateValues = emailVerificationValues(verificationLink)
    const loadedTemplate = loadTemplate(EMAIL_VERIFICATION_MAIL, templateValues);

    sendEmail(
      ZEPTO_CREDENTIALS.noReply,
      // EMAIL_SUBJECTS.EMAIL_VERIFICATION,
      loadedTemplate,
      {
        email: user.email
      }
    );

    console.log(`Email verification sent to ${user.email}`)
    return res.status(200).json({
      status: 'Success', 
      message: 'Email verification sent.' 
    });
  
  } catch (error) {

    console.log(`Error resending verification to ${username}`);
    return res.status(500).json({
      status: 'Failure', 
      error: 'Error resending verification'
    });

  }

});


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
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordsMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser._id);
    const updateuser = await User.findByIdAndUpdate(
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
    res.json({
      _id: findUser._id,
      name: findUser.username,
      role: findUser.role,
      token: generateToken(findUser._id, findUser.role),
    });
  } else {
    res.status(403).json({ error: 'Invalid Credentials' });
  }
});


const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie.refreshToken) throw new Error('no refresh token in cookies');
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error('no refresh token present in db or not matched');
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error('there is something wrong with refresh token');
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
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
  const user = await User.findOne({ email });
  if (!user) {
    console.log(`${email} not found`)
    return res.status(404).json({
      status: 'Failure',
      error: 'User not found' 
    });
  }
  
  try {
    const token = await user.createPasswordResetToken();
    await user.save();

    
    const resetUrl = `${FE_BASE_URL}${pageRoutes.auth.resetPassword}?token=${token}`;

    const templateValues = forgotPasswordValues(resetUrl)
    const loadedTemplate = loadTemplate(FORGOT_PASSWORD, templateValues);

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

    console.log(`Password reset link sent to ${email}`);
    return res.status(200).json({
      status: 'Success',
      message: 'Password reset email sent!',
    });
  } catch (error) {

    console.log(`Error sending password reset link to ${email}`);
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

    if (password) {
      user.password = password;
      user.passwordResetToken = null; // Might not be neccessary
      user.passwordResetExpires = null;
      
      await user.save();

      
      // Todo: Find better way to remove password from response data
      const updatedUser = await User.findById(decoded.id, {password:false, otp:false});
      
      console.log(`${user.username} password reset successful`)
      res.status(200).json({ 
        status: 'Success',
        message: 'Password reset successful', 
        data: updatedUser 
      });
    } else { 
      console.log(`Password not provided for <${id}>`)
      return res.status(400).json({ 
        status: 'Failure',
        error: 'Password not provided'
      });
    }

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('TokenExpiredError');
      return res.status(400).json({
        status: 'Failure', 
        error: 'Token expired'
      });
    } 
    else if (error.name === 'JsonWebTokenError') {
      console.log('Invalid password reset token');
      return res.status(403).json({
        status: 'Failure', 
        error: 'Invalid token'
      }); 
    }
    else {
      console.log(`Error updating password`);
      return res.status(500).json({
        status: 'Failure', 
        error: 'Error updating password' 
      }); 
    }
  }
});


module.exports = {
  createUser,
  createAdmin,
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
