const mongoose = require('mongoose');


let walletSchema = new mongoose.Schema(
  {
    // id: {      Id provided by the virtual account provider/holder
    //     type: String,
    //     required: true,
    // },
    user_id: {
      type: String,
      default: null,
      required: false,
    },
    escrowLocked: {
        type: Boolean,
        default: false,
    },
    escrowBalance: {
        type: Number,
        default: 0,
    },
    totalRevenue: {
        type: Number,
        default: 0,
    },
    // wallet_holder:{    Provider/Holder of the virtual account
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Kyc',
    //   default: null,
    //   required: false,
    // },
  },
  {
    timestamps: true,
  }
);

