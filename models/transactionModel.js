const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    initiator:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    customer: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    status: {
        type: String,
        enum: ['initiated', 'verified', 'completed', 'disputed'],
        default: 'initiated'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);

