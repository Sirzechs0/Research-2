// =====================================
// User Controller
// User management (admin functions)
// =====================================

const pool = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, full_name, role, is_allowed, created_at FROM users ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

// Get pending users (awaiting approval)
exports.getPendingUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, full_name, role, created_at FROM users WHERE is_allowed = false AND role = $1 ORDER BY created_at ASC',
            ['viewer']
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get pending users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pending users' });
    }
};

// Approve user (admin only)
exports.approveUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            'UPDATE users SET is_allowed = true WHERE id = $1 RETURNING id, email, full_name',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User approved successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({ success: false, message: 'Failed to approve user' });
    }
};

// Change user role (admin only)
exports.changeUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        const validRoles = ['viewer', 'staff', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid role. Must be viewer, staff, or admin' 
            });
        }

        const result = await pool.query(
            'UPDATE users SET role = $1, is_allowed = true WHERE id = $2 RETURNING id, email, full_name, role',
            [role, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Change role error:', error);
        res.status(500).json({ success: false, message: 'Failed to change user role' });
    }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        await pool.query('DELETE FROM attendance WHERE user_id = $1', [userId]);
        await pool.query('DELETE FROM staff WHERE user_id = $1', [userId]);
        await pool.query('DELETE FROM announcements WHERE author_id = $1', [userId]);
        
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};
