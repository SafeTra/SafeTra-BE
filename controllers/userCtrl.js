const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { validateMongodbid } = require('../util/validateMongodbid');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../config/jwtToken');
const { generateRefreshToken } = require('../config/refreshToken');
const sendEmail = require('../helpers/emailHelper');


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
      const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
      const verificationLink = `${baseUrl}/api/user/verify-email?otp=${otp}&email=${email}`;
      const otpMail = `
        <p>Hello,</p>
        <p>This is your one-time password: <b>${otp}</b>. Do not disclose this with anybody.</p>
        <p>Click <a href="${verificationLink}">here</a> to verify your email.</p>
      `;

      const data = {
        to: email,
        text: 'Hey User',
        subject: 'ONE TIME PASSWORD',
        html: otpMail,
      };
      sendEmail(data);
      console.log(`Verification Link: ${verificationLink}`);
      res.status(201).json({ message: 'OTP sent to your Email' });
    } else {
      res.status(409).json({ error: 'User already exists' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { otp, email } = req.query;

  try {
    const user = await User.findOne({ email, otp });
    if (!user) {
      return res.status(400).json({ error: 'Invalid OTP or email' });
    }
    user.isEmailVerified = true;
    user.otp = null;
    await user.save();
    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Error verifying email' });
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
      token: generateToken(findUser._id),
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
    const getUsers = await User.find();
    res.status(200).json(getUsers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

const getaSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching this user' });
  }
});

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({
      deleteUser,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting this user' });
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
    const resetUrl = `Hi please follow this link to reset your password.
     this link is valid till 10 minutes from now. <a href ='${baseUrl}/api/user/reset-password/${token}'>Click Here<a>`;
    const data = {
      to: email,
      text: 'Hey User',
      subject: 'FORGOT PASSWORD LINK',
      html: resetUrl,
    };
    sendEmail(data);
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
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Token expired or invalid, please try again later.' });
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    res.status(200).json({ message: 'Password reset successful', user });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
});


module.exports = {
  createUser,
  getAllUsers,
  getaSingleUser,
  loginUser,
  verifyOtp,
  verifyEmail,
  logout,
  handleRefreshToken,
  deleteaUser,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
};
