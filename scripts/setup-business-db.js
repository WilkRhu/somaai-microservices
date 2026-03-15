require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function setupBusinessDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_ROOT_USER || 'root',
      password: process.env.DB_ROOT_PASSWORD,
      multipleStatements: true,
    });

    console.log('✓ Connected to MySQL as root');
  } catch (error) {
    console.error('Error connecting to MySQL:', error.message);
    console.error('\nMake sure MySQL is running and accessible at localhost:3306');
    console.error('If using Docker, ensure the container is running: docker-compose up -d mysql-master');
    process.exit(1);
  }

  try {
    console.log('\nCreating somaai_business database...');
    await connection.query('CREATE DATABASE IF NOT EXISTS somaai_business');
    console.log('✓ Database created');

    console.log('\nGranting permissions to somaai user...');
    await connection.query('GRANT ALL PRIVILEGES ON somaai_business.* TO "somaai"@"%"');
    await connection.query('FLUSH PRIVILEGES');
    console.log('✓ Permissions granted');

    console.log('\nCreating business service tables...');
    
    const sql = `
      USE somaai_business;

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        phone VARCHAR(20),
        avatar VARCHAR(255),
        isActive BOOLEAN DEFAULT true,
        emailVerified BOOLEAN DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        lastLogin TIMESTAMP NULL
      );

      CREATE TABLE IF NOT EXISTS establishments (
        id VARCHAR(36) PRIMARY KEY,
        ownerId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        cnpj VARCHAR(20) UNIQUE,
        email VARCHAR(255),
        phone VARCHAR(20),
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(2),
        zipCode VARCHAR(10),
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS establishment_users (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        userId VARCHAR(36) NOT NULL,
        role VARCHAR(50) NOT NULL,
        invitedBy VARCHAR(36),
        invitedAt TIMESTAMP,
        acceptedAt TIMESTAMP,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (establishmentId) REFERENCES establishments(id),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (invitedBy) REFERENCES users(id),
        UNIQUE KEY unique_establishment_user (establishmentId, userId)
      );

      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        cpf VARCHAR(20) UNIQUE,
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(2),
        zipCode VARCHAR(10),
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (establishmentId) REFERENCES establishments(id)
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE,
        quantity INT DEFAULT 0,
        minQuantity INT DEFAULT 0,
        price DECIMAL(10, 2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (establishmentId) REFERENCES establishments(id)
      );

      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        customerId VARCHAR(36),
        totalAmount DECIMAL(10, 2),
        status VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (establishmentId) REFERENCES establishments(id),
        FOREIGN KEY (customerId) REFERENCES customers(id)
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        description VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2),
        category VARCHAR(100),
        status VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (establishmentId) REFERENCES establishments(id)
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        cnpj VARCHAR(20) UNIQUE,
        email VARCHAR(255),
        phone VARCHAR(20),
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(2),
        zipCode VARCHAR(10),
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (establishmentId) REFERENCES establishments(id)
      );

      CREATE TABLE IF NOT EXISTS offers (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        discountType VARCHAR(50),
        discountValue DECIMAL(10, 2),
        startDate TIMESTAMP,
        endDate TIMESTAMP,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (establishmentId) REFERENCES establishments(id)
      );
    `;

    await connection.query(sql);
    console.log('✓ All tables created successfully');

    console.log('\n✓ Business database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing business database:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupBusinessDatabase();
