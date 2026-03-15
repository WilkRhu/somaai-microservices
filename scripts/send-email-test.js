#!/usr/bin/env node

/**
 * Script para enviar um email de teste
 * Uso: node scripts/send-email-test.js
 */

const http = require('http');

const NOTIFICATIONS_URL = 'http://localhost:3005';

function makeRequest(method, url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function sendEmail() {
  console.log('\n📧 Enviando email de teste...\n');

  const emailData = {
    recipient: 'wilk.caetano@gmail.com',
    subject: 'Teste de Email - Sistema de Notificações',
    template: 'welcome',
    variables: {
      userName: 'Wilk Caetano',
      activationLink: 'https://example.com/activate/test-123',
      timestamp: new Date().toISOString(),
    },
  };

  try {
    console.log('📤 Enviando para:', emailData.recipient);
    console.log('📝 Assunto:', emailData.subject);
    console.log('🎨 Template:', emailData.template);
    console.log('');

    const response = await makeRequest(
      'POST',
      `${NOTIFICATIONS_URL}/notifications/email/send`,
      emailData
    );

    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Email enviado com sucesso!');
      console.log('📊 Status:', response.status);
      console.log('📋 Resposta:', JSON.stringify(response.body, null, 2));
    } else {
      console.log('❌ Erro ao enviar email');
      console.log('📊 Status:', response.status);
      console.log('📋 Resposta:', JSON.stringify(response.body, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
    console.log('\n💡 Dica: Certifique-se de que o serviço de notificações está rodando na porta 3005');
    console.log('   Execute: docker ps | grep notifications');
    process.exit(1);
  }
}

sendEmail();
