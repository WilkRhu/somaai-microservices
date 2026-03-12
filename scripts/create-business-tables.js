const mysql = require('mysql2/promise');

async function createBusinessTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    console.log('🔄 Creating Business Service tables...');
    
    await connection.query(`
      USE somaai_business;
      
      CREATE TABLE IF NOT EXISTS establishments (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cnpj VARCHAR(18) UNIQUE NOT NULL,
        type VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(2),
        zipCode VARCHAR(10),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        businessHours TEXT,
        logo VARCHAR(500),
        description TEXT,
        cashRegistersCount INT DEFAULT 1,
        loyaltyEnabled BOOLEAN DEFAULT false,
        loyaltyPointsPerReal DECIMAL(5, 3) DEFAULT 0,
        ownerId VARCHAR(36) NOT NULL,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP NULL,
        UNIQUE KEY unique_cnpj (cnpj),
        KEY idx_ownerId (ownerId)
      );

      CREATE TABLE IF NOT EXISTS establishment_members (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        userId VARCHAR(36) NOT NULL,
        role VARCHAR(50),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_establishmentId (establishmentId),
        KEY idx_userId (userId)
      );

      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        cpf VARCHAR(14),
        avatar VARCHAR(500),
        birthDate DATE,
        loyaltyPoints INT DEFAULT 0,
        totalSpent DECIMAL(10, 2) DEFAULT 0,
        purchaseCount INT DEFAULT 0,
        lastPurchaseDate TIMESTAMP,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_establishmentId (establishmentId),
        UNIQUE KEY unique_cpf (cpf)
      );

      CREATE TABLE IF NOT EXISTS inventory_items (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        barcode VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        brand VARCHAR(100),
        costPrice DECIMAL(10, 2),
        salePrice DECIMAL(10, 2),
        quantity INT DEFAULT 0,
        minQuantity INT DEFAULT 0,
        unit VARCHAR(20) DEFAULT 'UN',
        expirationDate DATE,
        description TEXT,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP NULL,
        KEY idx_establishmentId (establishmentId),
        UNIQUE KEY unique_barcode (barcode)
      );

      CREATE TABLE IF NOT EXISTS stock_movements (
        id VARCHAR(36) PRIMARY KEY,
        inventoryItemId VARCHAR(36) NOT NULL,
        saleId VARCHAR(36),
        type VARCHAR(50),
        quantity INT,
        reason VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_inventoryItemId (inventoryItemId),
        KEY idx_saleId (saleId)
      );

      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        customerId VARCHAR(36),
        totalAmount DECIMAL(10, 2),
        status VARCHAR(50),
        paymentMethod VARCHAR(50),
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_establishmentId_createdAt (establishmentId, createdAt),
        KEY idx_customerId (customerId),
        KEY idx_status (status)
      );

      CREATE TABLE IF NOT EXISTS sale_items (
        id VARCHAR(36) PRIMARY KEY,
        saleId VARCHAR(36) NOT NULL,
        inventoryItemId VARCHAR(36),
        quantity INT,
        unitPrice DECIMAL(10, 2),
        totalPrice DECIMAL(10, 2),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_saleId (saleId),
        KEY idx_inventoryItemId (inventoryItemId)
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        cnpj VARCHAR(20),
        email VARCHAR(255),
        phone VARCHAR(20),
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(2),
        zipCode VARCHAR(10),
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_establishmentId (establishmentId),
        KEY idx_cnpj (cnpj)
      );

      CREATE TABLE IF NOT EXISTS purchase_orders (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        supplierId VARCHAR(36),
        orderNumber VARCHAR(50) UNIQUE,
        status VARCHAR(50),
        totalAmount DECIMAL(10, 2),
        expectedDeliveryDate DATE,
        deliveryDate DATE,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_establishmentId_status (establishmentId, status),
        KEY idx_supplierId (supplierId)
      );

      CREATE TABLE IF NOT EXISTS business_expenses (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        category VARCHAR(50),
        description VARCHAR(255),
        amount DECIMAL(10, 2),
        paymentMethod VARCHAR(50),
        status VARCHAR(50),
        expenseDate DATE,
        dueDate DATE,
        paidDate DATE,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_establishmentId_expenseDate (establishmentId, expenseDate),
        KEY idx_establishmentId_status (establishmentId, status)
      );

      CREATE TABLE IF NOT EXISTS offers (
        id VARCHAR(36) PRIMARY KEY,
        establishmentId VARCHAR(36) NOT NULL,
        inventoryItemId VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        discountType VARCHAR(50),
        discountValue DECIMAL(10, 2),
        startDate TIMESTAMP,
        endDate TIMESTAMP,
        isActive BOOLEAN DEFAULT true,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        KEY idx_establishmentId_isActive (establishmentId, isActive),
        KEY idx_inventoryItemId (inventoryItemId)
      );

      CREATE TABLE IF NOT EXISTS offer_notifications (
        id VARCHAR(36) PRIMARY KEY,
        offerId VARCHAR(36) NOT NULL,
        customerId VARCHAR(36),
        sentAt TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_offerId_customerId (offerId, customerId)
      );
    `);
    
    console.log('✅ Business Service tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createBusinessTables();
