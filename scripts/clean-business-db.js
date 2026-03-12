const mysql = require('mysql2/promise');

async function cleanBusinessDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    console.log('🔄 Cleaning somaai_business database...');
    
    // Drop all tables
    await connection.query(`
      USE somaai_business;
      SET FOREIGN_KEY_CHECKS = 0;
      DROP TABLE IF EXISTS offer_notifications;
      DROP TABLE IF EXISTS offers;
      DROP TABLE IF EXISTS stock_movements;
      DROP TABLE IF EXISTS inventory_items;
      DROP TABLE IF EXISTS sale_items;
      DROP TABLE IF EXISTS sales;
      DROP TABLE IF EXISTS purchase_orders;
      DROP TABLE IF EXISTS suppliers;
      DROP TABLE IF EXISTS business_expenses;
      DROP TABLE IF EXISTS customers;
      DROP TABLE IF EXISTS establishment_members;
      DROP TABLE IF EXISTS establishments;
      SET FOREIGN_KEY_CHECKS = 1;
    `);
    
    console.log('✅ Database cleaned successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

cleanBusinessDb();
