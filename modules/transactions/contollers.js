const { FLW_CREDENTIALS, ZEPTO_CREDENTIALS } = require('../../config/env');
const mongoose = require('mongoose'); 
const axios = require('axios');
const { lockEscrowBalance, releaseEscrowBalance } = require('../wallets/contollers');
const { sendEmail, loadTemplate } = require('../../helpers/emailHelper');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Flutterwave = require('flutterwave-node-v3');
const { validateMongodbid } = require('../../util/validateMongodbid');
const { Transaction } = require('./models');
const { User } = require('../users/models');
const { newTransactionValues, NEW_TRANSACTION_MAIL } = require('../../helpers/mail_templates/newTransaction');
const { EMAIL_SUBJECTS } = require('../../helpers/enums');
const flw = new Flutterwave( FLW_CREDENTIALS.PUBLIC_KEY, FLW_CREDENTIALS.SECRET_KEY );

const createTransaction = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { title, category, party, profile, escrow_fee, price, inspection_period, shipping_fee_tax, description, currency, shipping_cost } = req.body;
  validateMongodbid(_id);

  try {
    /* TODO */
    // No need to check for user again after middleware approves
    const user = await User.findById(_id);
    const amount = price + shipping_cost;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const newTransaction = await Transaction.create({
      initiator_id: user.id,
      initiator_email: user.email,
      transaction_title: title,
      transaction_category: category,
      inspection_period: inspection_period,
      shipping_fee_tax: shipping_fee_tax,
      shipping_cost: shipping_cost,
      party: party,
      price: price,
      profile: profile,
      escrow_fee: escrow_fee,
      description: description,
      currency: currency,
      amount: amount,
    });

    const templateValues = newTransactionValues(newTransaction.initiator_email, newTransaction.amount, newTransaction.description)
    const loadedTemplate = loadTemplate(NEW_TRANSACTION_MAIL, templateValues);

    sendEmail(
        ZEPTO_CREDENTIALS.noReply,
        EMAIL_SUBJECTS.NEW_TRANSACTION,
        loadedTemplate,
        {
            email: party
        }
    );

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
      /* TODO */
      res.status(404).json({ 
        error: 'Transaction Not Found'
      });
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
  const flw_ref = req.session.flw_ref; //Data from previous session
  
  try {
    const response = await flw.Charge.validate({
      otp: otp,
      flw_ref: flw_ref,
    });
    console.log(response);

    if (response.status === 'success') {
      const transaction = await Transaction.findByIdAndUpdate(id, {
        status: 'VERIFIED',
      });
      
      await lockEscrowBalance(transaction._id, transaction.party);
    
      return res.status(200).json({ message: 'Escrow balance locked until transaction completion' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

const initiateWithdrawal = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { bank_name, account_number, amount, narration, currency } = req.body;

  try {

    /* TODO */
    // No need to check for user again after middleware approves
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    if (user.totalRevenue < amount) {
      return res.status(400).json({ error: 'Insufficient Balance' });
    }
    user.totalRevenue -= amount;
    await user.save();
    /* TODO */
    // Transfer HTML template to seperate file in helpers
    const data = {
      to: 'kayceeanosike1@gmail.com',
      text: 'Hey User',
      subject: 'New transaction initiated',
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Transaction Initiated</title>
      </head>
      <body>
      <h1>New Withdrawal Initiated</h1>
      <p>A new withdrawal has been initiated with the following details:</p>
      <ul>
          <li><strong>By:</strong> ${user.username}</li>
          <li><strong>Bank:</strong> ${bank_name}</li>
          <li><strong>Account Number:</strong> ${account_number}</li>
          <li><strong>Amount:</strong> ${currency} ${amount}</li>
          <li><strong>Narration:</strong> ${narration}</li>
      </ul>
      <p>Please review the withdrawal details and take necessary actions.</p>
      </body>
      </html>
      `,
    };
    sendEmail(data);
    res.status(200).json({ message: 'Withdrawal in Process. Your account will be credited in a few minutes.', payload: req.body });

  } catch (error) {
    console.error('Error making withdrawals:', error);
    res.status(500).json({ error: 'Cannot perform withdrawals' });
  }
});

const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {

    if (!editaTransaction || editaTransaction.is_deleted == true) {
      res.status(404).json({
        error: 'Transaction Not Found'
      })
    }

    const editaTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        party: req.body.party,
        amount: req.body.amount,
        description: req.body.description,
        currency: req.body.currency,
      },
      { new: true }
    );
    res.json(editaTransaction);
  } catch (error) {
    res.status(500).json({
      status: 'Fail',
      error: 'Internal Server Error'
    })
  }
});

const getTransactions = asyncHandler(async (req, res) => {
  try {
    const getTransactions = await Transaction.find({ is_deleted: false });
    res.json(getTransactions);
  } catch (error) {
    res.status(500).json({
      status: 'Fail',
      error: 'Internal Server Error'
    })
  }
});

const getaSingleTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const getSingleTransaction = await Transaction.findById(id); 
    if (!getSingleTransaction || getSingleTransaction.is_deleted == true) {
      return res.status(202).json({
        error: 'Transaction not found'
      })
    }
    res.json(getSingleTransaction);
  } catch (error) {
    res.status(500).json({ 
      status: 'Fail',
      error: 'Internal server error'
    });
  }
});

const confirmedTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.findById(id);

    if (!transaction || transaction.status !== 'VERIFIED'|| transaction.is_deleted == true) {
        return res.status(404).json({ 
          message: 'Transaction not found or not in a releasable state'
        });
    }

    transaction.status = 'COMPLETED';
    await transaction.save();
    
    await releaseEscrowBalance (transaction._id, transaction.party)
    return res.status(200).json({ 
      status: 'Success',
      message: 'Escrow balance released successfully'
     })

  } catch (error) {
    console.error('Error confirming receipt:', error);
    res.status(500).json({ 
      status: 'Fail',
      error: 'Internal server error'
    });
  }
});

const getOngoingTransaction = asyncHandler(async (req, res) => {
  try {
    const ongoingTransactions = await Transaction.find({
      initiator_id: req.user._id,
      status: 'INITIATED',
    });
    if (!ongoingTransactions || ongoingTransactions.length === 0 || ongoingTransactions.is_deleted == true) {
      return res.status(202).json({ 
        message : 'No initiated transactions found for the user'
      });
    }
    res.json(ongoingTransactions);
  } catch (error) {
    res.status(500).json({
      status: 'Fail',
      error: 'Internal Server Error'
    })
  }
});

const getCompletedTransaction = asyncHandler(async (req, res) => {
  try {
    const completedTransactions = await Transaction.find({
      initiator: req.user._id,
      status: 'COMPLETED',
    });
    if (!completedTransactions || completedTransactions.length === 0 || completedTransactions.is_deleted == true) {
      return res.status(202).json({ 
        message: 'No completed transactions found for the user'
      });
    }
    res.json(completedTransactions);
  } catch (error) {
    console.log(error)
    res.status(500).json({
      status: 'Fail',
      message: 'Internal Server Error'
    });
  }
});

const getPendingTransaction = asyncHandler(async (req, res) => {
  try {
    const pendingTransactions = await Transaction.find({
      initiator_id: req.user._id,
      status: 'VERIFIED',
    });
    if (!pendingTransactions || pendingTransactions.length === 0 || pendingTransactions.is_deleted == true) {
      return res.status(202).json({ message : 'No pending transactions found for this user'});
    }
    res.json(pendingTransactions);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error retrieving Transaction'});
  }
});

const deleteaTransaction = asyncHandler(async (req, res) => {
  /* TODO */
  // You should never delete a transaction
  const { id } = req.params;
  try {
    const deleteTransaction = await Transaction.findByIdAndUpdate(id, {is_deleted : true}, { new : true});
    res.json(deleteTransaction);
  } catch (error) {
    res.status(500).json({error: 'Error deleting this Transaction'});
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
  initiateWithdrawal,
};
