const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

const lockEscrowBalance = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  try {
    // Find the transaction
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'completed') {
      transaction.escrowLocked = true;
      await transaction.save();

      return res.json({
        message: 'Escrow balance locked until transaction completion',
      });
    } else {
      return res.status(400).json({ error: 'Transaction already completed' });
    }
  } catch (error) {
    console.error('Error locking escrow until completed:', error);
    res.status(500).json({ error: 'Failed to lock escrow until completed' });
  }
});

const releaseEscrowBalance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status === 'completed' && transaction.escrowLocked) {
      const user = await User.findOne({email:transaction.customer});

      if (!user) {
        throw new Error('User not found');
      }
      user.escrowBalance -= transaction.escrowAmount;
      transaction.escrowLocked = false;

      user.totalRevenue += transaction.escrowAmount;

      await user.save();
      await transaction.save();

      return res.json({ message: 'Escrow balance released successfully' });
    } else {
      return res
        .status(400)
        .json({
          error: 'Escrow balance cannot be released for this transaction',
        });
    }
  } catch (error) {
    console.error('Error releasing escrow balance:', error);
    res.status(500).json({ error: 'Failed to release escrow balance' });
  }
});

module.exports = {
  lockEscrowBalance,
  releaseEscrowBalance,
};
