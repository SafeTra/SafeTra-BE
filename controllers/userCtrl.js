const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { validateMongodbid } = require('../util/validateMongodbid');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { generateToken, verificationToken } = require('../config/jwtToken');
const { generateRefreshToken } = require('../config/refreshToken');
const {
  sendEmail,
  loadTemplate
} = require('../helpers/emailHelper');
const { ROLES } = require('../models/enums');
const kyc = require('../models/kycModel');
const { FORGOT_PASSWORD, forgotPasswordValues } = require('../helpers/mail_templates/forgotPassword');
const { ZEPTO_CREDENTIALS, FE_BASE_URL } = require('../config/env');
const { EMAIL_SUBJECTS } = require('../helpers/enums');
const { emailVerificationValues, EMAIL_VERIFICATION } = require('../helpers/mail_templates/emailVerification');
const { pageRoutes } = require('../lib/pageRoutes');


const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const findUser = await User.findOne({ email });
    if (!findUser) {
      const otp = Math.floor(1000 + Math.random() * 9000);

      const newUser = await User.create({
        username,
        email,
        password,
        otp,
      });
      
      const newUserKyc = await kyc.create({
        customer: newUser._id,
        email
      })

      const token = verificationToken(newUser._id, newUser.role, email)
      const verificationLink = `${FE_BASE_URL}${pageRoutes.auth.confirmEmail}/verify-email?token=${token}`;

      const templateValues = emailVerificationValues(verificationLink)
      const loadedTemplate = loadTemplate(EMAIL_VERIFICATION, templateValues);
      sendEmail(
        ZEPTO_CREDENTIALS.noReply,
        EMAIL_SUBJECTS.EMAIL_VERIFICATION,
        loadedTemplate,
        {
          email: email
        }
      );

      res.status(201).json({ message: 'Verification link sent' });
    } else {
      res.status(409).json({ error: 'User already exists' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating user'});
  }
});

const createAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const findAdmin = await User.findOne({ email });

    if (!findAdmin) {
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
    } else {
      console.log(`Admin ${email} already exists!`)
      return res.status(409).json({
        status: 'Failure', 
        message: 'Admin already exists.' 
      });
    }
  } catch (error) {
    console.log(`Admin ${email} creation failed!`)
    return res.status(200).json({
      status: 'Failure', 
      message: 'Admin creation failed!' 
    });
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
      return res.status(403).json({
        status: 'Failure', 
        error: 'Invalid token'
      }); 
    }
    else {
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
    const verificationLink = `${FE_BASE_URL}${pageRoutes.auth.confirmEmail}/verify-email?token=${token}`;

    const templateValues = emailVerificationValues(verificationLink)
    const loadedTemplate = loadTemplate(EMAIL_VERIFICATION, templateValues);
    sendEmail(
      ZEPTO_CREDENTIALS.noReply,
      EMAIL_SUBJECTS.EMAIL_VERIFICATION,
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

    user.isEmailVerified = true;
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

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find({role: ROLES.USER}, {password:false, otp:false});
    res.status(200).json(getUsers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

const getAllAdmins = asyncHandler(async (req, res) => {
  try {
    const getAdmins = await User.find({role: ROLES.ADMIN}, {password:false, otp:false});
    res.status(200).json(getAdmins);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching admins' });
  }
});

const getaSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const getaUser = await User.findById(id, {password:false, otp:false});
    res.json({
      getaUser,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching this user' });
  }
});

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    validateMongodbid(id);
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({
      deleteUser,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting this user' });
  }
});


// To be used in place of deleting users
const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    validateMongodbid(id);
    const deactivatedUser = await User.findById(id);
    deactivatedUser.active = false;
    await deactivatedUser.save();
    res.json({
      deactivatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deactivating this user' });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, email, mobile, address }  = req.body;
  try {
    validateMongodbid(id);
    const updatedUser = await User.findByIdAndUpdate(id,
      {
        username,
        address
      },
      {new: true, runValidators: true}
     );
    res.json({
      updateUser,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating this user' });
  }
});


const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongodbid(_id);
  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (password) {
      user.password = password;
      const updatedPassword = await user.save();
      return res.status(200).json({ message: 'Password updated successfully', user: updatedPassword });
    } else { 
      return res.status(400).json({ error: 'Password not provided' });
    }
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ error: 'Error updating password' });
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'User not found with this email' });
  }
    try {
    const token = await user.createPasswordResetToken();
    await user.save();
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
    const resetUrl = `${baseUrl}/api/user/reset-password/${token}`;

    const templateValues = forgotPasswordValues(resetUrl)
    const loadedTemplate = loadTemplate(FORGOT_PASSWORD, templateValues);
    sendEmail(
      process.env.NO_REPLY_ADDRESS || ZEPTO_CREDENTIALS.noReply,
      EMAIL_SUBJECTS.FORGOT_PASSWORD,
      loadedTemplate,
      {
        email: email,
        firstName: user.firstname,
        firstName: user.lastname,
      }
    );
    res.status(200).json({ message: 'Password reset link sent to email', token });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return res.status(500).json({ error: 'Error sending password reset email' });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Token expired or invalid, please try again later.' });
    }
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    res.status(200).json({ message: 'Password reset successful', user });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
});


module.exports = {
  createUser,
  createAdmin,
  updateUser,
  getAllUsers,
  getAllAdmins,
  getaSingleUser,
  loginUser,
  verifyOtp,
  verifyEmail,
  sendVerificationEmail,
  validateEmail,
  logout,
  handleRefreshToken,
  deleteaUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
};
