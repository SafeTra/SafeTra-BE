const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');
const axios = require('axios');
const Escrow = require('../controllers/escrowCtrl');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);
const { validateMongodbid } = require('../util/validateMongodbid');

// const flw_ref = req.session.flw_ref;

const createTransaction = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { customer, amount, description, currency } = req.body;
  validateMongodbid(_id);

  try {
    const newTransaction = await Transaction.create({
      initiator: req.user._id,
      customer: customer,
      amount: amount,
      description: description,
      currency: currency,
    });
    res.json(newTransaction);
  } catch (error) {
    console.log('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

const initiateTransactionPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    email,
    fullname,
    cardNumber,
    cvv,
    expiryDate,
    currency,
    amount,
    pin,
  } = req.body;
  try {
    const transactionDetails = await Transaction.findById(id);
    if (!transactionDetails) {
      throw new Error('Transaction Not Found');
    }

    const expiryDateFormat = expiryDate;
    const [expiryMonth, expiryYear] = expiryDateFormat.split('/');

    let payload = {
      card_number: cardNumber,
      cvv: cvv,
      expiry_month: expiryMonth,
      expiry_year: expiryYear,
      currency: currency,
      amount: amount,
      email: email,
      fullname: fullname,
      tx_ref: JSON.stringify(id),
      enckey: process.env.FLW_ENCRYPTION_KEY,
      //redirect_url: "https://example_company.com/success",
      authorization: {
        mode: 'pin',
        pin: pin,
      },
    };
    const response = await flw.Charge.card(payload);
    console.log(response);
    req.session.flw_ref = response.data.flw_ref;
    res.json({ success: true, otp: response.otp });
    
  } catch (error) {
    console.log('Error initiating transaction:', error);
    res.status(500).json({ error: 'Failed to initiate transaction' });
  }
});

const verifyPayment = asyncHandler(async (req, res,) => {
  const { id } = req.params;
  const { otp } = req.body;
  const flw_ref = req.session.flw_ref;
  
  try {
    const response = await flw.Charge.validate({
      otp: otp,
      flw_ref: flw_ref,
    });
    console.log(response);

    if (response.status === 'success') {
      const transaction = await Transaction.findByIdAndUpdate(id, {
        status: 'verified',
      });
      
      await Escrow.lockEscrowBalance(transaction._id, transaction.customer);
    
    return res.status(200).json({ message: 'Escrow balance locked until transaction completion' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const editaTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        customer: req.body.customer,
        amount: req.body.amount,
        description: req.body.description,
        currency: req.body.currency,
      },
      { new: true }
    );

    if (!editaTransaction) {
      throw new Error('No transaction found');
    }
    res.json(editaTransaction);
  } catch (error) {
    throw new Error(error);
  }
});

const getTransactions = asyncHandler(async (req, res) => {
  try {
    const getTransactions = await Transaction.find();
    res.json(getTransactions);
  } catch (error) {
    throw new Error(error);
  }
});

const getaSingleTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const getSingleTransaction = await Transaction.findById(id); 
    if (!getSingleTransaction) {
      throw new Error('No transaction found');
    }
    res.json(getSingleTransaction);
  } catch (error) {
    throw new Error(error);
  }
});

const confirmedTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.findById(id);

    if (!transaction || transaction.status !== 'verified') {
        return res.status(404).json({ message: 'Transaction not found or not in a releasable state'});
    }

    transaction.status = 'completed';
    await transaction.save();
    
    await Escrow.releaseEscrowBalance (transaction._id, transaction.customer)
    return res.status(200).json({ message: 'Escrow balance released successfully' })

  } catch (error) {
    console.error('Error confirming receipt:', error);
    throw new Error('Internal server error');
  }
});

const getOngoingTransaction = asyncHandler(async (req, res) => {
  try {
    const ongoingTransactions = await Transaction.find({
      initiator: req.user._id,
      status: 'initiated',
    });
    if (!ongoingTransactions || ongoingTransactions.length === 0) {
      return res.status(404).json({ message : 'No initiated transactions found for the user'});
    }
    res.json(ongoingTransactions);
  } catch (error) {
    console.log(error)
    throw new Error('Error retrieving Transaction ');
  }
});

const getCompletedTransaction = asyncHandler(async (req, res) => {
  try {
    const completedTransactions = await Transaction.find({
      initiator: req.user._id,
      status: 'completed',
    });
    if (!completedTransactions || completedTransactions.length === 0) {
      return res.status(404).json({ message: 'No completed transactions found for the user' });
    }
    res.json(completedTransactions);
  } catch (error) {
    console.log(error)
    throw new Error('Error retrieving Transaction');
  }
});

const getPendingTransaction = asyncHandler(async (req, res) => {
  try {
    const pendingTransactions = await Transaction.find({
      initiator: req.user._id,
      status: 'verified',
    });
    if (!pendingTransactions || pendingTransactions.length === 0) {
      return res.status(404).json({ message : 'No pending transactions found for this user'});
    }
    res.json(pendingTransactions);
  } catch (error) {
    console.log(error)
    throw new Error('Error retrieving Transaction');
  }
});

const deleteaTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteTransaction = await Transaction.findByIdAndDelete(id);
    res.json(deleteTransaction);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createTransaction,
  initiateTransactionPayment,
  verifyPayment,
  getTransactions,
  getaSingleTransaction,
  updateTransaction,
  getOngoingTransaction,
  getPendingTransaction,
  getCompletedTransaction,
  deleteaTransaction,
  confirmedTransaction,
};
