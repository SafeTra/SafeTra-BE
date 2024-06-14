const mongoose = require('mongoose'); 
const { ID_TYPE } = require('./enums');

let kycSchema = new mongoose.Schema({
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    isIdVerified: {
        type: Boolean,
        default: false,
    },
    idType: {
        type: String,
        enum: [ID_TYPE.NIN, ID_TYPE.DRIVERS_LICENSE, ID_TYPE.VOTER_ID, ID_TYPE.BVN],
        default: ID_TYPE.NIN,
    },
    idCredentials: {
        type: Object,
        default: {},
    },
}, {
    timestamps: true,
});

//Export the model
module.exports = mongoose.model('Kyc', kycSchema);
