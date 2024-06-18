const mongoose = require('mongoose');


let walletSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    }
  },
  {
    timestamps: true,
  }
);

module.exports = { walletSchema }