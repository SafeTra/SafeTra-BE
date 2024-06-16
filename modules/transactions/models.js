const mongoose = require('mongoose'); 
const { TXN_STATUS, CURRENCY } = require('./enums');

let transactionSchema = new mongoose.Schema({
    initiator_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    initiator_email:{
        type: String,
    },
    party:{
        type:String,
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    item_id: {
        type: String,
    },
    description:{
        type:String,
    },
    currency: {
        type: String,
        enum: [CURRENCY.NGN, CURRENCY.USD, CURRENCY.GBP],
        required: true,
        default: "NGN",
    },
    status: {
        type: String,
        enum: [TXN_STATUS.INITIATED, TXN_STATUS.COMPLETED, TXN_STATUS.VERIFIED, TXN_STATUS.PENDING, TXN_STATUS.FAILED],
        default: TXN_STATUS.INITIATED,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
    initiated_at: {
        type: Date,
        required: false,
        default: null,
    },
    completed_at: {
        type: Date,
        required: false,
        default: null,
    },
    verified_at: {
        type: Date,
        required: false,
        default: null,
    },
    failed_at: {
        type: Date,
        required: false,
        default: null,
    },
}, {
    timestamps: true,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

//Export the model
module.exports = {
    Transaction,
}
