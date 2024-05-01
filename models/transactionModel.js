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
        type:Number,
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
}, {
    timestamps: true,
});

//Export the model
module.exports = mongoose.model('Transaction', transactionSchema);
