const mongoose = require('mongoose'); 
const { TXN_STATUS, CURRENCY, SHIPPING_FEE_TAX} = require('./enums');

let transactionSchema = new mongoose.Schema({
    initiator_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    initiator_email:{
        type: String,
    },
    transaction_title: {
        type: String,
        required: true,
    },
    party:{
        type: String,
        required:true,
    },
    price:{
        type: Number,
        required:true,
    },
    inspection_period: {
        type: Number,
    },
    transaction_category: {
        type: String,
    },
    amount: {
        type: Number,
    },
    item_id: {
        type: String,
    },
    description:{
        type: String,
    },
    currency: {
        type: String,
        enum: [CURRENCY.NGN, CURRENCY.USD, CURRENCY.GBP],
        required: true,
        default: "NGN",
    },
    shipping_method: {
        type: String,
    },
    shipping_cost: {
        type: Number,
        required: true,
    },
    shipping_fee_tax: {
        type: String,
        enum: [SHIPPING_FEE_TAX.BUYER, SHIPPING_FEE_TAX.SELLER],
        default: SHIPPING_FEE_TAX.BUYER,
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
