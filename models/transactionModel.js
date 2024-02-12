const mongoose = require('mongoose'); 

let transactionSchema = new mongoose.Schema({
    initiator:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    customer:{
        type:String,
        required:true,
    },
    amount:{
        type:String,
        required:true,
       
    },
    description:{
        type:String,
        required:true,
    },
    currency: {
        type: String,
        required: true,
        default: "NGN",
    },
    status: {
        type: String,
        enum: ['initiated', 'completed', 'verified', 'pending'],
        default: 'initiated',
    },
    escrowAmount:{
        type: Number,
        default: 0,
    },
    escrowLocked: {
        type: Boolean,
        default: true,
    },

}, {
    timestamps: true,
});

//Export the model
module.exports = mongoose.model('Transaction', transactionSchema);
