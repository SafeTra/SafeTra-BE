const mongoose = require('mongoose');


let walletSchema = new mongoose.Schema(
  {
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
    }
  },
  {
    timestamps: true,
  }
);

