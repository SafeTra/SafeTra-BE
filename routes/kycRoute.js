const express = require ('express');
const router = express.Router();
const multer = require ('multer');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { 
    kycUpdate,
    kycVerification,
 } = require('../controllers/kycCtrl');

const upload = multer ({dest: 'uploads/'});


router.post('/verify-KYC/:id', authMiddleware, kycVerification);
router.post('/update-KYC/:id', authMiddleware, kycUpdate);


module.exports = router;