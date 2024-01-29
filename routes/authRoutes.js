const express = require ('express');
const { createUser, getAllUsers, getaSingleUser, loginUser } = require('../controllers/userCtrl');
const isAdmin = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register' , createUser);
router.get ('/all-users', getAllUsers);
router.get ('/:id', isAdmin, getaSingleUser );
router.post('/login', loginUser)

module.exports = router;