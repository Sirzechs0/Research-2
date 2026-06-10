const pool = require('../config/database');

(async () => {
  try {
    const email = process.argv[2];
    if (!email) {
      console.error('Usage: node checkUser.js user@example.com');
      process.exit(1);
    }

    const result = await pool.query('SELECT id, email, full_name, role, is_allowed FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      console.log('User not found:', email);
    } else {
      console.log('User record:', result.rows[0]);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error checking user:', err);
    process.exit(1);
  }
})();
