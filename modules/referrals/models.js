const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const referralSchema = new mongoose.Schema({
    referrer: {
        type: String,
        required: true,
    },
    referee: {
        type: String,
        require: true,
    },

    /*

    Try taking this approach:

    referrer - A mapping to the user instance of the owner
    link - The referral link
    downlines - A list of users that used the link (one to many mapping)
    last_usage - Always to be updated to present time when ever the link is used

    referrer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    link: {
        type: String,
        default: null,
        required: true,
    },
    downlines: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    last_usage: {
        type: String,
        default: null,
        required: true,
    }

    */


},
    {
        timestamps: true,
    }
);

const Referral = mongoose.model('Referal', referralSchema);


module.exports = {
    Referral
};

