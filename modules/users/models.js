const mongoose = require('mongoose');
// const crypto = require('crypto');
// const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken');
const { ID_TYPE, ROLES } = require('./enums');




let userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      default: null,
      required: false,
    },
    lastname: {
      type: String,
      default: null,
      required: false,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      default: ROLES.USER,
      enum: [ROLES.USER , ROLES.ADMIN],
    },
    is_active: {
      type: Boolean,
      default: true,
      required: true,
    },
    profile:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      default: null,
      required: false,
    },
    kyc:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kyc',
      default: null,
      required: false,
    },
    wallet:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      default: null,
      required: false,
    },
    password_changed_at: Date,
    password_reset_token: String,
    password_reset_expires: Date,
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

userSchema.methods.kyc_checker = async function () {
  const userKyc = await Kyc.findOne({ user_id: this._id })
  if ( 
    this.role === ROLES.USER && 
    userKyc.is_email_verified && 
    userKyc.is_id_verified && 
    userKyc.is_mobile_verified
  )
    return true;
  else 
    return false;
};

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken  = jwt.sign(
    {id: this.id, role: this.role}, 
    process.env.JWT_SECRET, 
    {expiresIn: '600000'}     // 10 minutes
  );

  this.passwordResetToken = resetToken
  
  return resetToken;
};

// MIDDLEWARE TO SET 'passwordChangedAt' PROPERTY
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.password_changed_at = Date.now() - 1000;

  next();
});

// QUERY MIDDLEWARE TO HIDE INACTIVE ACCOUNTS
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
  
});


let profileSchema = new mongoose.Schema({
    user_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: {
      type: String,
      default: null,
      required: false,
    },
    dob: {
      type: String,
      default: null,
      required: false,
    },
    photo: {
      type: String,
      default: null,
      required: false,
    },
    mobile: {
      type: String,
      default: null,
      required: false, 
    },
    is_active: {
      type: Boolean,
      default: true,
      required: true,
    },
    id_type: {
      type: String,
      enum: [ID_TYPE.NIN, ID_TYPE.DRIVERS_LICENSE, ID_TYPE.VOTER_ID, ID_TYPE.BVN],
      default: ID_TYPE.NIN,
      required: true,
    },
    id_credentials: {
      type: Object,
      default: {},
    },
}, {
    timestamps: true,
});



let kycSchema = new mongoose.Schema({
    user_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    user_profile_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: false,
    },
    is_email_verified: {
      type: Boolean,
      default: false,
      required: true,
    },
    is_mobile_verified: {
      type: Boolean,
      default: false,
      required: false,
    },
    is_id_verified: {
      type: Boolean,
      default: false,
      required: false,
    },
}, {
    timestamps: true,
});

// Declare models
const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Kyc = mongoose.model('Kyc', kycSchema);

//Export the models
module.exports = {
  User, 
  Profile, 
  Kyc,
}
