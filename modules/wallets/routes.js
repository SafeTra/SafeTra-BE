const express = require ('express');
const { releaseEscrowBalance, lockEscrowBalance } = require('../controllers/escrowCtrl');

const walletRouter = express.Router();
const route = '/wallets'

walletRouter.put('/lock/:id', lockEscrowBalance );
walletRouter.put('/release/:id', releaseEscrowBalance);


module.exports = {
    walletRouter,
    route
}