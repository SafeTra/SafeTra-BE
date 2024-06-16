const express = require ('express');
const { authMiddleware, isAdmin } = require('../../middlewares/authMiddleware');
const { 
    createTransaction, 
    initiateTransactionPayment, 
    verifyPayment, 
    updateTransaction, 
    getTransactions, 
    getOngoingTransaction, 
    getPendingTransaction, 
    getCompletedTransaction, 
    deleteaTransaction, 
    getaSingleTransaction, 
    confirmedTransaction, 
    initiateWithdrawal
} = require('./contollers');

const router = express.Router();

const transactionRouter = express.Router();
const route = '/transactions';


transactionRouter.post('/create-transaction', authMiddleware, createTransaction);
transactionRouter.post('/pay-for-transaction/:id', authMiddleware, initiateTransactionPayment);
transactionRouter.post('/verify-payment/:id', authMiddleware,verifyPayment);
transactionRouter.get('/get-transaction/:id', authMiddleware, getaSingleTransaction)
transactionRouter.patch('/update-transaction/:id', authMiddleware, updateTransaction);
transactionRouter.get('/all-transactions', authMiddleware, isAdmin, getTransactions);
transactionRouter.get('/ongoing-transactions', authMiddleware, getOngoingTransaction);
transactionRouter.get('/pending-transactions', authMiddleware, getPendingTransaction);
transactionRouter.get('/completed-transactions', authMiddleware, getCompletedTransaction);
transactionRouter.post('/confirm-transaction/:id', authMiddleware, confirmedTransaction);
transactionRouter.post('/withdraw', authMiddleware, initiateWithdrawal);
transactionRouter.delete('/delete-transaction/:id', authMiddleware, isAdmin, deleteaTransaction);

module.exports = {
    transactionRouter,
    route,
};