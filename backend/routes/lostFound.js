// =====================================
// Lost & Found Routes
// =====================================

const express = require('express');
const lostFoundController = require('../controllers/lostFoundController');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// Public - view items
router.get('/', lostFoundController.getLostFound);
router.get('/:id', lostFoundController.getItemById);

// Authenticated users - post items
router.post('/', verifyToken, lostFoundController.postItem);

// Admin/Staff or owner - update items
router.put('/:id', verifyToken, lostFoundController.updateItem);

// Admin or owner - delete items
router.delete('/:id', verifyToken, lostFoundController.deleteItem);

module.exports = router;
