#!/usr/bin/env node

/**
 * Script de teste para notificações via Kafka através do orquestrador
 * Testa a integração completa: Orquestrador -> Kafka -> Serviço de Notificações
 */

const http = require('http');
const { Kafka } = require('kafkajs');

// Configuração
const ORCHESTRATOR_URL = 'http://localhost:3000';
const NOTIFICATIONS_URL = 'http://localhost:3005';
const KAFKA_BROKERS = ['localhost:9092'];

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Utilitários
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(50)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(50)}${colors.reset}\n`),
};

// Função para fazer requisições HTTP
function makeRequest(method, url, data = null) {
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

// Função para testar endpoint
async function testEndpoint(method, url, data, description) {
  log.info(`${description}`);
  try {
    const response = await makeRequest(method, url, data);
    if (response.status >= 200 && response.status < 300) {
      log.success(`${method} ${url} - Status: ${response.status}`);
      console.log(`  Response: ${JSON.stringify(response.body, null, 2)}`);
    } else {
      log.error(`${method} ${url} - Status: ${response.status}`);
      console.log(`  Response: ${JSON.stringify(response.body, null, 2)}`);
    }
  } catch (error) {
    log.error(`${method} ${url} - ${error.message}`);
  }
  console.log('');
}

// Função para monitorar eventos Kafka
async function monitorKafkaEvents() {
  log.section('Monitorando eventos Kafka');

  try {
    const kafka = new Kafka({
      clientId: 'notification-test-consumer',
      brokers: KAFKA_BROKERS,
    });

    const consumer = kafka.consumer({ groupId: 'notification-test-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'notification.send', fromBeginning: false });

    log.info('Conectado ao Kafka, aguardando eventos...');

    const timeout = setTimeout(() => {
      log.warn('Timeout: nenhum evento recebido em 10 segundos');
      consumer.disconnect();
    }, 10000);

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        clearTimeout(timeout);
        log.success(`Evento recebido no Kafka`);
        console.log(`  Topic: ${topic}`);
        console.log(`  Partition: ${partition}`);
        console.log(`  Message: ${message.value.toString()}`);
        await consumer.disconnect();
      },
    });
  } catch (error) {
    log.error(`Erro ao monitorar Kafka: ${error.message}`);
  }
}

// Testes principais
async function runTests() {
  log.section('Teste de Notificações via Orquestrador');

  // 1. Envio de notificação por email
  log.section('1. Envio de Notificação por EMAIL');
  await testEndpoint(
    'POST',
    `${NOTIFICATIONS_URL}/notifications/send`,
    {
      userId: 'user-123',
      type: 'EMAIL',
      title: 'Bem-vindo',
      message: 'Sua conta foi criada com sucesso',
      recipient: 'user@example.com',
      metadata: {
        source: 'orchestrator-test',
        timestamp: new Date().toISOString(),
      },
    },
    'Enviando notificação de email'
  );

  // 2. Envio de notificação em lote
  log.section('2. Envio de Notificações em LOTE');
  await testEndpoint(
    'POST',
    `${NOTIFICATIONS_URL}/notifications/send-bulk`,
    {
      notifications: [
        {
          userId: 'user-123',
          type: 'EMAIL',
          title: 'Promoção',
          message: 'Aproveite 20% de desconto',
          recipient: 'user@example.com',
        },
        {
          userId: 'user-456',
          type: 'EMAIL',
          title: 'Promoção',
          message: 'Aproveite 20% de desconto',
          recipient: 'another@example.com',
        },
      ],
    },
    'Enviando notificações em lote'
  );

  // 3. Atualizar preferências
  log.section('3. Atualizar PREFERÊNCIAS de Notificação');
  await testEndpoint(
    'PUT',
    `${NOTIFICATIONS_URL}/notifications/preferences/user-123`,
    {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: true,
    },
    'Atualizando preferências'
  );

  // 4. Obter preferências
  log.section('4. Obter PREFERÊNCIAS de Notificação');
  await testEndpoint(
    'GET',
    `${NOTIFICATIONS_URL}/notifications/preferences/user-123`,
    null,
    'Recuperando preferências'
  );

  // 5. Registrar device token
  log.section('5. Registrar DEVICE TOKEN');
  await testEndpoint(
    'POST',
    `${NOTIFICATIONS_URL}/notifications/device-tokens`,
    {
      userId: 'user-123',
      deviceToken: {
        token: 'device-token-abc123xyz',
        platform: 'ios',
        deviceName: 'iPhone 14',
      },
    },
    'Registrando device token'
  );

  // 6. Enviar email direto
  log.section('6. Enviar EMAIL Direto');
  await testEndpoint(
    'POST',
    `${NOTIFICATIONS_URL}/notifications/email/send`,
    {
      recipient: 'test@example.com',
      subject: 'Teste de Email',
      template: 'welcome',
      variables: {
        userName: 'João Silva',
        activationLink: 'https://example.com/activate/123',
      },
    },
    'Enviando email direto'
  );

  // 7. Enviar emails em lote
  log.section('7. Enviar EMAILS em LOTE');
  await testEndpoint(
    'POST',
    `${NOTIFICATIONS_URL}/notifications/email/send-bulk`,
    {
      emails: [
        {
          recipient: 'user1@example.com',
          subject: 'Promoção Especial',
          template: 'promotion',
          variables: {
            discount: '20%',
            expiryDate: '2026-03-31',
          },
        },
        {
          recipient: 'user2@example.com',
          subject: 'Promoção Especial',
          template: 'promotion',
          variables: {
            discount: '20%',
            expiryDate: '2026-03-31',
          },
        },
      ],
    },
    'Enviando emails em lote'
  );

  // 8. Obter notificações do usuário
  log.section('8. Obter NOTIFICAÇÕES do Usuário');
  await testEndpoint(
    'GET',
    `${NOTIFICATIONS_URL}/notifications/user-123?limit=10&offset=0`,
    null,
    'Recuperando notificações'
  );

  // 9. Monitorar eventos Kafka
  await monitorKafkaEvents();

  log.section('Testes Concluídos');
  log.success('Todos os testes foram executados!');
  console.log('\nPróximos passos:');
  console.log('1. Verificar logs do serviço de notificações');
  console.log('2. Validar eventos no Kafka');
  console.log('3. Confirmar envio de emails');
  console.log('4. Testar integração com o orquestrador');
}

// Executar testes
runTests().catch((error) => {
  log.error(`Erro ao executar testes: ${error.message}`);
  process.exit(1);
});
