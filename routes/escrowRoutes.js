const express = require ('express');
const { releaseEscrowBalance, lockEscrowBalance } = require('../controllers/escrowCtrl');
const router = express.Router();

router.put('/lock/:id', lockEscrowBalance );
router.put('/release/:id', releaseEscrowBalance);


module.exports = router;