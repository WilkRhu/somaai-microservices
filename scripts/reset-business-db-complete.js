const mysql = require('mysql2/promise');

async function resetBusinessDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    console.log('🔄 Dropping somaai_business database...');
    await connection.query('DROP DATABASE IF EXISTS somaai_business');
    console.log('✅ Database dropped');

    console.log('🔄 Creating somaai_business database...');
    await connection.query('CREATE DATABASE somaai_business');
    console.log('✅ Database created');

    console.log('✅ Complete reset successful!');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

resetBusinessDb();
