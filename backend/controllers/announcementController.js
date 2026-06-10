// =====================================
// Announcements Controller
// CRUD operations for announcements
// =====================================

const pool = require('../config/database');

// Get all announcements (anyone can view)
exports.getAnnouncements = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.id, a.title, a.content, a.category, 
                   u.full_name as author, a.created_at
            FROM announcements a
            LEFT JOIN users u ON a.author_id = u.id
            ORDER BY a.created_at DESC
        `);

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
    }
};

// Get single announcement
exports.getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT a.id, a.title, a.content, a.category,
                   u.full_name as author, a.created_at, a.updated_at
            FROM announcements a
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get announcement error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch announcement' });
    }
};

// Create announcement (admin/staff only)
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const authorId = req.user.id;

        if (!title || !content) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title and content are required' 
            });
        }

        const result = await pool.query(
            'INSERT INTO announcements (title, content, category, author_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, category || 'General', authorId]
        );

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ success: false, message: 'Failed to create announcement' });
    }
};

// Update announcement (admin/staff only)
exports.updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category } = req.body;

        const result = await pool.query(
            'UPDATE announcements SET title = COALESCE($1, title), content = COALESCE($2, content), category = COALESCE($3, category), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [title, content, category, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.json({
            success: true,
            message: 'Announcement updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({ success: false, message: 'Failed to update announcement' });
    }
};

// Delete announcement (admin only)
exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM announcements WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }

        res.json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete announcement' });
    }
};
