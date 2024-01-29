const express = require ('express');
const { createUser, getAllUsers, getaSingleUser, loginUser, logout, handleRefreshToken } = require('../controllers/userCtrl');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register' , createUser);
router.get ('/all-users', getAllUsers);
router.post('/login', loginUser);
router.get('/refresh', handleRefreshToken)
router.get('/logout', logout);
router.get ('/:id',authMiddleware, isAdmin, getaSingleUser );

module.exports = router;