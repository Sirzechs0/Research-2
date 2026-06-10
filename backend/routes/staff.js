// =====================================
// Staff Directory Routes
// =====================================

const express = require('express');
const staffController = require('../controllers/staffController');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Public - view staff
router.get('/', staffController.getStaff);
router.get('/:id', staffController.getStaffById);

// Admin only - manage staff
router.post('/', verifyToken, checkRole(['admin']), staffController.addStaff);
router.put('/:id', verifyToken, checkRole(['admin']), staffController.updateStaff);
router.delete('/:id', verifyToken, checkRole(['admin']), staffController.deleteStaff);

module.exports = router;
