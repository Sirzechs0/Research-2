// =====================================
// Attendance Controller
// CRUD operations for attendance
// =====================================

const pool = require('../config/database');

// Get attendance records
exports.getAttendance = async (req, res) => {
    try {
        const { userId, date } = req.query;
        let query = 'SELECT a.id, a.user_id, u.full_name, a.date, a.status, a.remarks, a.created_at FROM attendance a LEFT JOIN users u ON a.user_id = u.id WHERE 1=1';
        const params = [];

        if (userId) {
            query += ' AND a.user_id = $' + (params.length + 1);
            params.push(userId);
        }
        if (date) {
            query += ' AND a.date = $' + (params.length + 1);
            params.push(date);
        }

        query += ' ORDER BY a.date DESC, u.full_name ASC';

        const result = await pool.query(query, params);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
    }
};

// Record attendance (admin/staff only)
exports.recordAttendance = async (req, res) => {
    try {
        const { userId, date, status, remarks } = req.body;

        if (!userId || !date || !status) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID, date, and status are required' 
            });
        }

        // Check if record exists
        const existing = await pool.query(
            'SELECT id FROM attendance WHERE user_id = $1 AND date = $2',
            [userId, date]
        );

        let result;
        if (existing.rows.length > 0) {
            // Update existing record
            result = await pool.query(
                'UPDATE attendance SET status = $1, remarks = $2 WHERE user_id = $3 AND date = $4 RETURNING *',
                [status, remarks || null, userId, date]
            );
        } else {
            // Create new record
            result = await pool.query(
                'INSERT INTO attendance (user_id, date, status, remarks) VALUES ($1, $2, $3, $4) RETURNING *',
                [userId, date, status, remarks || null]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Attendance recorded successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Record attendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to record attendance' });
    }
};

// Get attendance report by date
exports.getAttendanceReport = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ 
                success: false, 
                message: 'Date parameter is required' 
            });
        }

        const result = await pool.query(`
            SELECT u.id, u.full_name, COALESCE(a.status, 'Absent') as status
            FROM users u
            LEFT JOIN attendance a ON u.id = a.user_id AND a.date = $1
            WHERE u.role != 'admin'
            ORDER BY u.full_name ASC
        `, [date]);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch attendance report' });
    }
};

// Delete attendance record (admin only)
exports.deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM attendance WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Attendance record not found' });
        }

        res.json({
            success: true,
            message: 'Attendance record deleted successfully'
        });
    } catch (error) {
        console.error('Delete attendance error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete attendance' });
    }
};
