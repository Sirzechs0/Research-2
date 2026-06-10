const pool = require('../config/database');

(async () => {
  try {
    const email = process.argv[2];
    if (!email) {
      console.error('Usage: node promoteUser.js user@example.com');
      process.exit(1);
    }

    const result = await pool.query(
      "UPDATE users SET role = 'admin', is_allowed = true WHERE email = $1 RETURNING id, email, full_name, role",
      [email]
    );

    if (result.rows.length === 0) {
      console.log('No user found with email:', email);
      process.exit(0);
    }

    console.log('Promoted user to admin:', result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Error promoting user:', err);
    process.exit(1);
  }
})();
