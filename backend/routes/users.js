// =====================================
// User Management Routes
// =====================================

const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Admin only routes
router.get('/all', verifyToken, checkRole(['admin']), userController.getAllUsers);
router.get('/pending', verifyToken, checkRole(['admin']), userController.getPendingUsers);
router.put('/approve/:userId', verifyToken, checkRole(['admin']), userController.approveUser);
router.put('/role/:userId', verifyToken, checkRole(['admin']), userController.changeUserRole);
router.delete('/:userId', verifyToken, checkRole(['admin']), userController.deleteUser);

module.exports = router;
