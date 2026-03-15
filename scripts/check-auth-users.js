const mysql = require('mysql2/promise');

async function checkAuthUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'somaai',
    password: 'somaai_password',
    database: 'somaai_master',
  });

  try {
    console.log('🔍 Verificando usuários no AUTH...\n');

    // Verificar usuários
    const [users] = await connection.execute(
      'SELECT id, email, firstName, lastName, authProvider, role, isActive, createdAt FROM users ORDER BY createdAt DESC LIMIT 10'
    );

    console.log('📊 Usuários encontrados:', users.length);
    console.log('');
    
    if (users.length > 0) {
      console.log('✅ Usuários no AUTH:');
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
      console.log('❌ Nenhum usuário encontrado no AUTH!');
    }

    console.log('\n---\n');

    // Contar totais
    const [userCount] = await connection.execute('SELECT COUNT(*) as total FROM users');
    console.log('📈 Total de usuários no AUTH:', userCount[0].total);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await connection.end();
  }
}

checkAuthUsers();
