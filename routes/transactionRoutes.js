const express = require ('express');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { createTransaction, initiateTransactionPayment, verifyPayment, updateTransaction, getTransactions, getOngoingTransaction, getPendingTransaction, getCompletedTransaction, deleteaTransaction, getaSingleTransaction} = require('../controllers/transactionCtrl');
const router = express.Router();

router.post('/create-transaction', authMiddleware, createTransaction);
router.post('/pay-for-transaction/:id', authMiddleware, initiateTransactionPayment);
router.post('/verify-payment', authMiddleware,verifyPayment);
router.get('/get-transaction/:id', authMiddleware, getaSingleTransaction)
router.patch('/update-transaction/:id', authMiddleware, updateTransaction);
router.get('/all-transactions', authMiddleware, isAdmin, getTransactions);
router.get('/ongoing-transactions', authMiddleware, getOngoingTransaction);
router.get('/pending-transactions', authMiddleware, getPendingTransaction);
router.get('/completed-transactions', authMiddleware, getCompletedTransaction);
router.delete('/delete-transaction/:id', authMiddleware, isAdmin, deleteaTransaction);

module.exports = router;