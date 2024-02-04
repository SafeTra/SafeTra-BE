const express = require ('express');
const router = express.Router();
const multer = require ('multer');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { handleKYC } = require('../controllers/kycCtrl');

const upload = multer ({dest: 'uploads/'});


router.post('/update-KYC/:id', authMiddleware, upload.single('photo'), handleKYC);


module.exports = router;