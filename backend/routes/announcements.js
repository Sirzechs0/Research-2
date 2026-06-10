// =====================================
// Announcements Routes
// =====================================

const express = require('express');
const announcementController = require('../controllers/announcementController');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Public - anyone can view
router.get('/', announcementController.getAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);

// Admin/Staff only - create, edit, delete
router.post('/', verifyToken, checkRole(['admin', 'staff']), announcementController.createAnnouncement);
router.put('/:id', verifyToken, checkRole(['admin', 'staff']), announcementController.updateAnnouncement);
router.delete('/:id', verifyToken, checkRole(['admin']), announcementController.deleteAnnouncement);

module.exports = router;
