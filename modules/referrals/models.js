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

},
    {
        timestamps: true,
    }
);

const Referral = mongoose.model('Referal', referralSchema);


module.exports = {
    Referral
};

