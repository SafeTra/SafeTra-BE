const mongoose = require('mongoose'); 

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
        required: true,
        default: "NGN",
    },
    status: {
        type: String,
        enum: ['initiated', 'completed', 'verified', 'pending', 'failed'],
        default: 'initiated',
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

//Export the model
module.exports = mongoose.model('Transaction', transactionSchema);
