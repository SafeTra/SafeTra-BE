const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');

let userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    mobile: {
      type: String, 
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },
    address: {
      type: String,
    },
    dob: {
      type: Date,
    },
    photo: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    otp: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    escrowLocked: {
      type: Boolean,
      default: false,
    },
    escrowBalance: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.isPasswordsMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resettoken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return resettoken;
};

// MIDDLEWARE TO SET 'passwordChangedAt' PROPERTY
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// QUERY MIDDLEWARE TO HIDE INACTIVE ACCOUNTS
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
  
});

module.exports = mongoose.model('User', userSchema);
