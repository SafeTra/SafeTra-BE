const mongoose = require('mongoose');
const crypto = require ('crypto');
const bcrypt = require ('bcrypt');

let userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role: {
        type: String,
        default: 'user'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    paswordResetExpire: Date,
}, {
    timestamps: true,
});

userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.isPasswordsMatched = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createPasswordResetToken = async function () {
    const resettoken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resettoken).digest('hex');
    this.passwordResetExpires = Date.now() + 30 * 60 * 100; // 10 minutes
    return resettoken;
}

module.exports = mongoose.model('User', userSchema);