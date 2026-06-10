// =====================================
// Staff Controller
// CRUD operations for staff directory
// =====================================

const pool = require('../config/database');

// Get all staff members
exports.getStaff = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.id, u.full_name, s.position, s.department, s.phone, u.email
            FROM staff s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY u.full_name ASC
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch staff' });
    }
};

// Get staff member by ID
exports.getStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT s.id, u.full_name, s.position, s.department, s.phone, u.email
            FROM staff s
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch staff member' });
    }
};

// Add staff member (admin only)
exports.addStaff = async (req, res) => {
    try {
        const { userId, position, department, phone } = req.body;

        if (!userId || !position) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID and position are required' 
            });
        }

        const result = await pool.query(
            'INSERT INTO staff (user_id, position, department, phone) VALUES ($1, $2, $3, $4) RETURNING *',
            [userId, position, department || null, phone || null]
        );

        res.status(201).json({
            success: true,
            message: 'Staff member added successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Add staff error:', error);
        res.status(500).json({ success: false, message: 'Failed to add staff member' });
    }
};

// Update staff member (admin only)
exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { position, department, phone } = req.body;

        const result = await pool.query(
            'UPDATE staff SET position = COALESCE($1, position), department = COALESCE($2, department), phone = COALESCE($3, phone) WHERE id = $4 RETURNING *',
            [position, department, phone, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        res.json({
            success: true,
            message: 'Staff member updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update staff error:', error);
        res.status(500).json({ success: false, message: 'Failed to update staff member' });
    }
};

// Delete staff member (admin only)
exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM staff WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        res.json({
            success: true,
            message: 'Staff member deleted successfully'
        });
    } catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete staff member' });
    }
};
