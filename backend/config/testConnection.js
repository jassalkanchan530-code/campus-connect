require('dotenv').config();
const db = require('./db');

(async () => {
  try {
    const [rows] = await db.execute('SELECT 1 + 1 AS result');
    console.log('✅ MySQL connection successful. Test query result:', rows[0].result);

    const [tables] = await db.execute(
      `SELECT TABLE_NAME, TABLE_ROWS
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ?
       ORDER BY TABLE_NAME`,
      [process.env.DB_NAME]
    );
    console.log('\n📋 Tables in campusconnect database:');
    tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));

    process.exit(0);
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
})();
