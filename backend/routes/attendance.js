// =====================================
// Attendance Routes
// =====================================

const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Public - view attendance (filtered)
router.get('/', attendanceController.getAttendance);
router.get('/report', attendanceController.getAttendanceReport);

// Admin/Staff only - record and manage
router.post('/', verifyToken, checkRole(['admin', 'staff']), attendanceController.recordAttendance);
router.delete('/:id', verifyToken, checkRole(['admin']), attendanceController.deleteAttendance);

module.exports = router;
