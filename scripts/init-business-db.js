const mysql = require('mysql2/promise');

async function initializeDatabase() {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('Connected to MySQL');

    // Create the database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS somaai_business');
    console.log('Database somaai_business created or already exists');

    await connection.end();
    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
