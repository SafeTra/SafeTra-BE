const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');

const lockEscrowBalance = async (id, customer) => {
  
  try {
    console.log(customer,id);
    const [transaction, user] = await Promise.all([
      Transaction.findById(id),
      User.findOne({ email: customer })
    ]);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (!user) {
      throw new Error('User not found');
    }

    if (transaction.status !== 'completed') {
      user.escrowLocked = true;
      user.escrowBalance += transaction.amount;
      await user.save();
      //return { message: 'Escrow balance locked until transaction completion' };
    } else {
      throw new Error('Transaction already completed');
    }
  } catch (error) {
    console.error('Error locking escrow until completed:', error);
    throw new Error('Failed to lock escrow until completed');
  }
};


const releaseEscrowBalance = async (transactionId) => {
  try {
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status === 'completed' && transaction.escrowLocked) {
      const user = await User.findOne({ email: transaction.customer });

      if (!user) {
        throw new Error('User not found');
      }

      user.escrowBalance -= transaction.escrowAmount;
      transaction.escrowLocked = false;
      user.totalRevenue += transaction.escrowAmount;

      await user.save();
      await transaction.save();

      return { message: 'Escrow balance released successfully' };
    } else {
      throw new Error('Escrow balance cannot be released for this transaction');
    }
  } catch (error) {
    console.error('Error releasing escrow balance:', error);
    throw new Error('Failed to release escrow balance');
  }
};

module.exports = {
  lockEscrowBalance,
  releaseEscrowBalance,
};
