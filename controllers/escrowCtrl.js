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


const releaseEscrowBalance = async (id,customer) => {
  /* TODO */
  // Pass the transaction & user/customer instance to avoid finding again
  try {
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

    if (transaction.status === 'completed') {

      /* TODO */
      user.escrowBalance -= transaction.amount;
      user.totalRevenue += transaction.amount;
      await user.save();
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
