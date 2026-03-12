const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function resetDatabases() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    console.log('🔄 Dropping existing databases...');
    
    const databases = [
      'somaai_auth',
      'somaai_monolith',
      'somaai_business',
      'somaai_sales',
      'somaai_inventory',
      'somaai_delivery',
      'somaai_suppliers',
      'somaai_offers',
      'somaai_fiscal',
      'somaai_ocr',
      'somaai_payments',
    ];

    for (const db of databases) {
      try {
        await connection.query(`DROP DATABASE IF EXISTS ${db}`);
        console.log(`  ✓ Dropped ${db}`);
      } catch (error) {
        console.log(`  ⚠ Could not drop ${db}: ${error.message}`);
      }
    }

    console.log('\n🔄 Creating databases...');
    const sqlFile = fs.readFileSync(path.join(__dirname, 'init-databases.sql'), 'utf8');
    await connection.query(sqlFile);
    console.log('✅ Databases created successfully!');
    
    // Verify databases were created
    const [createdDbs] = await connection.query('SHOW DATABASES LIKE "somaai_%"');
    console.log('\n📊 Created databases:');
    createdDbs.forEach(db => {
      console.log(`  ✓ ${Object.values(db)[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Error resetting databases:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

resetDatabases();
