const axios = require('axios');

const API_URL = 'http://localhost:3009/api/business';
const ESTABLISHMENT_ID = '28953c8f-1570-42bc-8053-2de96122604a';
const TOKEN = 'seu-token-jwt-aqui'; // Substitua com um token válido

async function testCreateSale() {
  try {
    console.log('🛒 Testando criação de venda...\n');

    const payload = {
      items: [
        {
          itemId: 'fa470111-7dec-4484-a9a7-d6ded2db733f',
          unitPrice: 3.9,
          quantity: 1,
          discount: 0,
        },
      ],
      paymentMethod: 'cash',
      discount: 0,
    };

    console.log('📤 Enviando payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('\n');

    const response = await axios.post(
      `${API_URL}/establishments/${ESTABLISHMENT_ID}/sales`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`,
        },
      }
    );

    console.log('✅ Venda criada com sucesso!');
    console.log('\n📋 Resposta:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('\n✨ Sale ID:', response.data.id);
    console.log('✨ Sale Number:', response.data.saleNumber);
    console.log('✨ Total:', response.data.total);
  } catch (error) {
    console.error('❌ Erro ao criar venda:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Mensagem:', error.message);
    }
  }
}

testCreateSale();
