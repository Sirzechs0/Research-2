const pool = require('../config/database');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const email = process.argv[2];
    const password = process.argv[3];
    const fullName = process.argv[4] || 'Admin User';

    if (!email || !password) {
      console.error('Usage: node createAdminDirect.js email password [fullName]');
      process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 10);

    // Upsert user: if exists, update password/role; else insert
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      const res = await pool.query(
        'UPDATE users SET password = $1, full_name = $2, role = $3, is_allowed = true, updated_at = CURRENT_TIMESTAMP WHERE email = $4 RETURNING id, email, full_name, role',
        [hashed, fullName, 'admin', email]
      );
      console.log('Updated existing user to admin:', res.rows[0]);
    } else {
      const res = await pool.query(
        'INSERT INTO users (email, password, full_name, role, is_allowed) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role',
        [email, hashed, fullName, 'admin', true]
      );
      console.log('Created admin user:', res.rows[0]);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
})();
