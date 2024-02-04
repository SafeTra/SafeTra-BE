const express = require ('express');
const { createUser, getAllUsers, getaSingleUser, loginUser, logout, handleRefreshToken, deleteaUser, updatePassword, resetPassword, forgotPasswordToken } = require('../controllers/userCtrl');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register' , createUser);
router.get ('/all-users', getAllUsers);
router.post('/login', loginUser);
router.get('/refresh', handleRefreshToken)
router.get('/logout', logout);
router.get ('/:id',authMiddleware, isAdmin, getaSingleUser );
router.delete('/:id', deleteaUser);
router.post ('/forgot-password-token', forgotPasswordToken);
router.put ('/reset-password/:token', resetPassword);
router.put('/password', authMiddleware, updatePassword);


module.exports = router;