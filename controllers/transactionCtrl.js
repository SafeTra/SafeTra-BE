const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const axios = require("axios");
const Escrow = require('../controllers/escrowCtrl');
const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const Flutterwave = require("flutterwave-node-v3");
const flw = new Flutterwave(
  "FLWPUBK_TEST-303f686c88eb60396a90f8ca7655cd8e-X",
  "FLWSECK_TEST-0664b1fec3503bbe6fa30d00ba9f9c0f-X"
);
const { validateMongodbid } = require("../util/validateMongodbid");

const createTransaction = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { customer, amount, description, currency } = req.body;
  validateMongodbid(_id);

  try {
    // const receiver = await User.findById(customer);
    // if (!receiver) {
    //   return res.status(404).json({ error: "receiver not found" });
    // }

    // payload = {
    //   card_number: "4556052704172643",
    //   cvv: "899",
    //   expiry_month: "01",
    //   expiry_year: "23",
    //   currency: "NGN",
    //   amount: "7500",
    //   email: "user@example.com",
    //   fullname: "Flutterwave Developers",
    //   tx_ref: "YOUR_PAYMENT_REFERENCE",
    //   enckey: process.env.FLW_ENCRYPTION_KEY,
    //   redirect_url: "https://example_company.com/success",
    //   authorization: {
    //     mode: "pin",
    //     pin: "3310",
    //   },
    // };

    // let authData = cardDetails;
    // const encryptionKey = crypto.randomBytes(32);
    // const iv = crypto.randomBytes(16);
    // const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);
    // authData = cipher.update(JSON.stringify(authData), "utf-8", "hex");
    // authData += cipher.final("hex");
    // console.log("Encrypted DATA: ", authData);

    const newTransaction = await Transaction.create({
      initiator: req.user._id,
      customer: customer,
      amount: amount,
      description: description,
      currency: currency,
    });
    res.json(newTransaction);
  } catch (error) {
    console.log("Error creating transaction:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

const initiateTransactionPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, fullname, cardNumber, cvv, expiryDate, currency, amount, pin } = req.body;
  try {
    const transactionDetails = await Transaction.findById(id);
    if (!transactionDetails) {
      throw new Error("Transaction Not Found");
    }

    const expiryDateFormat = expiryDate;
    const [expiryMonth, expiryYear] = expiryDateFormat.split("/");

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
        mode: "pin",
        pin: pin,
      },
    };
    const response = await flw.Charge.card(payload);
    console.log(response);
    res.json({ success: true, otp: response.otp });
  } catch (error) {
    console.log("Error initiating transaction:", error);
    res.status(500).json({ error: "Failed to initiate transaction" });
  }
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { otp } = req.body; 
  try {
    const response = await flw.Charge.validate({
      otp: otp,
    });

    if (response.status === 'successful') {
      const transaction = await Transaction.findByIdAndUpdate(id, { status: 'verified' });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      await Escrow.lockEscrowBalance(req, res);

      return res.json(response);
    } else {
      return res.status(400).json({ error: "Transaction verification failed" });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});


const updateTransaction = asyncHandler (async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const editaTransaction = await Transaction.findByIdAndUpdate(id, {
      customer: req.body.customer,
      amount: req.body.amount,
      description: req.body.description,
      currency: req.body.currency,
    },{ new : true});

    if (!editaTransaction){
      throw new Error ('No transaction found')
    }
    res.json(editaTransaction);
  } catch (error) {
    throw new Error (error)
  }
});


const getTransactions = asyncHandler (async (req, res) => {
  try {
    const getTransactions = await Transaction.find();
    res.json(getTransactions);
} catch (error) {
    throw new Error (error);
}
});

const getaSingleTransaction = asyncHandler (async (req, res) => {
  const { id } = req.params;
  validateMongodbid(id);
  try {
    const getSingleTransaction = await Transaction.find(id)
    if (!getSingleTransaction){
      throw new Error ('No transaction found')
    }
    res.json(getSingleTransaction);
  } catch (error) {
    throw new Error (error)
  }
})

const getOngoingTransaction = asyncHandler (async (req,res) => {
  try {
    const ongoingTransactions = await Transaction.find({initiator: req.user._id, status: 'initiated'})
    if (!ongoingTransactions || ongoingTransactions.length === 0) {
      throw new Error('No initiated transactions found for the user');
    }
    res.json(ongoingTransactions);
  } catch (error) {
    throw new Error ('Error retrieving Transaction ')
  }
})

const getCompletedTransaction = asyncHandler (async (req,res) => {
  try {
    const completedTransactions = await Transaction.find({initiator: req.user._id, status: 'completed'})
    if (!completedTransactions || completedTransactions.length === 0) {
      throw new Error('No completed transactions found for the user');
    }
    res.json(completedTransactions);
  } catch (error) {
    throw new Error ('Error retrieving Transaction')
  }
})

const getPendingTransaction = asyncHandler (async (req,res) => {
  try {
    const pendingTransactions = await Transaction.find({initiator: req.user._id, status: 'pending'})
    if (!pendingTransactions || pendingTransactions.length === 0) {
      throw new Error('No pending transactions found for the user');
    }
    res.json(pendingTransactions);
  } catch (error) {
    throw new Error ('Error retrieving Transaction')
  }
})

const deleteaTransaction = asyncHandler (async (req, res) => {
  const { id } = req.params;
  try {
    const deleteTransaction = await Transaction.findByIdAndDelete(id);
    res.json(deleteTransaction);
  } catch (error) {
    throw new Error(error);
  }
})

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
};
