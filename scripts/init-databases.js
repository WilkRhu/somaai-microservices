const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabases() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    const sqlFile = fs.readFileSync(path.join(__dirname, 'init-databases.sql'), 'utf8');
    
    console.log('🔄 Initializing databases...');
    await connection.query(sqlFile);
    console.log('✅ Databases initialized successfully!');
    
    // Verify databases were created
    const [databases] = await connection.query('SHOW DATABASES LIKE "somaai_%"');
    console.log('\n📊 Created databases:');
    databases.forEach(db => {
      console.log(`  ✓ ${Object.values(db)[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Error initializing databases:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initializeDatabases();
