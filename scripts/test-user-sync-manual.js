const axios = require('axios');

async function testUserSync() {
  const userId = 'f0cab758-0d6c-4820-9816-fc29bd5cec8f';
  const userEmail = 'wilk.caetano@gmail.com';

  console.log('🧪 Testando sincronização manual de usuário...\n');
  console.log(`📝 Usuário: ${userEmail}`);
  console.log(`🆔 ID: ${userId}\n`);

  try {
    // Tentar sincronizar via HTTP
    console.log('🔄 Tentando sincronizar via HTTP...');
    
    const response = await axios.post(
      'http://localhost:3000/api/users/internal/sync-from-auth',
      {
        id: userId,
        email: userEmail,
        firstName: 'Wilk',
        lastName: 'Caetano de França',
        phone: null,
        avatar: null,
        authProvider: 'EMAIL',
        role: 'USER',
        emailVerified: false,
      },
      {
        headers: {
          'X-Internal-Service': 'auth-service',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Sincronização bem-sucedida!');
    console.log('📦 Resposta:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('❌ Erro na sincronização:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Mensagem: ${error.response?.data?.message || error.message}`);
    console.error(`   Detalhes: ${JSON.stringify(error.response?.data, null, 2)}`);
  }
}

testUserSync();
