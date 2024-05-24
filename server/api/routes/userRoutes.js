const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// User routes
router.get('/profile/:user_id', authMiddleware.verifyUser, userController.getUserProfile);
router.put('/profile/:user_id', authMiddleware.verifyUser, userController.updateUserProfile);
router.delete('/delete/:user_id', authMiddleware.verifyAdmin, userController.deleteUser);

module.exports = router;
