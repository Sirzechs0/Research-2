// =====================================
// Lost & Found Controller
// CRUD operations for lost & found items
// =====================================

const pool = require('../config/database');

// Get all lost & found items
exports.getLostFound = async (req, res) => {
    try {
        const { type, status } = req.query;
        let query = 'SELECT l.id, l.title, l.description, l.type, l.location, l.date_posted, l.status, u.full_name as posted_by, l.contact_info, l.created_at FROM lost_found l LEFT JOIN users u ON l.posted_by_id = u.id WHERE 1=1';
        const params = [];

        if (type) {
            query += ' AND l.type = $' + (params.length + 1);
            params.push(type);
        }
        if (status) {
            query += ' AND l.status = $' + (params.length + 1);
            params.push(status);
        }

        query += ' ORDER BY l.created_at DESC';

        const result = await pool.query(query, params);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get lost & found error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch lost & found items' });
    }
};

// Get single item
exports.getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT l.id, l.title, l.description, l.type, l.location, l.date_posted, l.status,
                   u.full_name as posted_by, l.contact_info, l.created_at
            FROM lost_found l
            LEFT JOIN users u ON l.posted_by_id = u.id
            WHERE l.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get item error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch item' });
    }
};

// Post lost or found item (authenticated users, but admin/staff priority)
exports.postItem = async (req, res) => {
    try {
        const { title, description, type, location, datePosted, contactInfo } = req.body;
        const postedById = req.user.id;

        if (!title || !type) {
            return res.status(400).json({ 
                success: false, 
                message: 'Title and type are required' 
            });
        }

        const result = await pool.query(
            'INSERT INTO lost_found (title, description, type, location, date_posted, posted_by_id, contact_info, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [title, description || null, type, location || null, datePosted || new Date().toISOString().split('T')[0], postedById, contactInfo || null, 'open']
        );

        res.status(201).json({
            success: true,
            message: 'Item posted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Post item error:', error);
        res.status(500).json({ success: false, message: 'Failed to post item' });
    }
};

// Update item status (admin/staff or original poster)
exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, description } = req.body;

        // Check permissions
        const itemResult = await pool.query('SELECT posted_by_id FROM lost_found WHERE id = $1', [id]);
        if (itemResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const isOwner = itemResult.rows[0].posted_by_id === req.user.id;
        const isStaff = ['admin', 'staff'].includes(req.user.role);

        if (!isOwner && !isStaff) {
            return res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }

        const result = await pool.query(
            'UPDATE lost_found SET status = COALESCE($1, status), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
            [status, description, id]
        );

        res.json({
            success: true,
            message: 'Item updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ success: false, message: 'Failed to update item' });
    }
};

// Delete item (admin only or original poster)
exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        const itemResult = await pool.query('SELECT posted_by_id FROM lost_found WHERE id = $1', [id]);
        if (itemResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const isOwner = itemResult.rows[0].posted_by_id === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }

        await pool.query('DELETE FROM lost_found WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        console.error('Delete item error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete item' });
    }
};
