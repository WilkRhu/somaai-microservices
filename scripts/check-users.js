const mysql = require('mysql2/promise');

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'somaai',
    password: 'somaai_password',
    database: 'somaai_monolith',
  });

  try {
    console.log('🔍 Verificando usuários no monolith...\n');

    // Verificar usuários
    const [users] = await connection.execute(
      'SELECT id, email, firstName, lastName, authProvider, role, isActive, createdAt FROM users ORDER BY createdAt DESC LIMIT 10'
    );

    console.log('📊 Usuários encontrados:', users.length);
    console.log('');
    
    if (users.length > 0) {
      console.log('✅ Usuários:');
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Nome: ${user.firstName} ${user.lastName}`);
        console.log(`   Provider: ${user.authProvider}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Ativo: ${user.isActive}`);
        console.log(`   Criado: ${user.createdAt}`);
      });
    } else {
      console.log('❌ Nenhum usuário encontrado!');
    }

    console.log('\n---\n');

    // Verificar purchases
    const [purchases] = await connection.execute(
      'SELECT id, userId, merchant, totalAmount, type, status, purchasedAt, createdAt FROM purchases ORDER BY createdAt DESC LIMIT 10'
    );

    console.log('📦 Purchases encontradas:', purchases.length);
    console.log('');

    if (purchases.length > 0) {
      console.log('✅ Purchases:');
      purchases.forEach((purchase, index) => {
        console.log(`\n${index + 1}. ${purchase.merchant}`);
        console.log(`   ID: ${purchase.id}`);
        console.log(`   User ID: ${purchase.userId}`);
        console.log(`   Valor: R$ ${purchase.totalAmount}`);
        console.log(`   Tipo: ${purchase.type}`);
        console.log(`   Status: ${purchase.status}`);
        console.log(`   Criado: ${purchase.createdAt}`);
      });
    } else {
      console.log('❌ Nenhuma purchase encontrada!');
    }

    console.log('\n---\n');

    // Contar totais
    const [userCount] = await connection.execute('SELECT COUNT(*) as total FROM users');
    const [purchaseCount] = await connection.execute('SELECT COUNT(*) as total FROM purchases');
    const [itemCount] = await connection.execute('SELECT COUNT(*) as total FROM purchase_items');

    console.log('📈 Totais:');
    console.log(`   Usuários: ${userCount[0].total}`);
    console.log(`   Purchases: ${purchaseCount[0].total}`);
    console.log(`   Purchase Items: ${itemCount[0].total}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

checkUsers();
