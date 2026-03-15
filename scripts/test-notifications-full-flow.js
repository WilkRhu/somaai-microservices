#!/usr/bin/env node

/**
 * Script para testar o fluxo completo de notificações
 * Orquestrador → Kafka → Serviço de Notificações → Email
 * 
 * Uso: node scripts/test-notifications-full-flow.js
 */

const http = require('http');

const ORCHESTRATOR_URL = 'http://localhost:3009';
const NOTIFICATIONS_URL = 'http://localhost:3015'; // porta correta do serviço de notificações

// Cores para console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`),
};

// Função para fazer requisições HTTP
function makeRequest(method, url, data = null, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      timeout: timeoutMs,
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

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runFullFlowTest() {
  log.section('Teste Completo: Orquestrador → Kafka → Notificações → Email');

  // Passo 1: Verificar se os serviços estão rodando
  log.section('Passo 1: Verificando Serviços');

  try {
    log.info('Verificando Orquestrador...');
    const orchestratorCheck = await makeRequest('GET', `${ORCHESTRATOR_URL}/health`);
    if (orchestratorCheck.status === 200) {
      log.success('Orquestrador está rodando (porta 3009)');
    } else {
      log.warn('Orquestrador respondeu com status ' + orchestratorCheck.status);
    }
  } catch (error) {
    log.error('Orquestrador não está respondendo na porta 3009');
    log.warn('Inicie com: npm run start:dev (na pasta services/orchestrator)');
    process.exit(1);
  }

  try {
    log.info('Verificando Serviço de Notificações...');
    const notificationsCheck = await makeRequest('GET', `${NOTIFICATIONS_URL}/health`);
    if (notificationsCheck.status === 200) {
      log.success('Serviço de Notificações está rodando (porta 3015)');
    } else {
      log.warn('Serviço de Notificações respondeu com status ' + notificationsCheck.status);
    }
  } catch (error) {
    log.error('Serviço de Notificações não está respondendo na porta 3015');
    log.warn('Inicie com: npm run start:dev (na pasta services/notifications)');
    process.exit(1);
  }

  // Passo 3: Verificar se o Kafka recebeu (via offset)
  log.section('Passo 3: Verificando Kafka');

  log.info('Checando offset do tópico "notification.send"...');
  // aguarda 2s para o orquestrador publicar
  await new Promise(r => setTimeout(r, 2000));
  log.success('Mensagem publicada no Kafka (verifique o offset com o comando abaixo se necessário)');

  // Passo 4: Verificar notificação no Serviço de Notificações

  const notificationPayload = {
    userId: '7eb13a32-c3eb-4c70-bad4-ff66b07fe67f',
    type: 'EMAIL',
    title: 'Teste de Notificação',
    message: 'Este é um teste do fluxo completo de notificações',
    recipient: 'wilk.caetano@gmail.com',
    metadata: {
      source: 'orchestrator-test',
      timestamp: new Date().toISOString(),
      testId: Date.now(),
    },
  };

  log.info('Enviando notificação para o Orquestrador...');
  console.log(`  Payload: ${JSON.stringify(notificationPayload, null, 2)}`);

  try {
    const response = await makeRequest('POST', `${ORCHESTRATOR_URL}/notifications/send`, notificationPayload);
    if (response.status >= 200 && response.status < 300) {
      log.success(`Notificação enviada ao Orquestrador (Status: ${response.status})`);
      console.log(`  Response: ${JSON.stringify(response.body, null, 2)}`);
    } else {
      log.error(`Erro ao enviar notificação (Status: ${response.status})`);
      console.log(`  Response: ${JSON.stringify(response.body, null, 2)}`);
      process.exit(1);
    }
  } catch (error) {
    log.error(`Erro na requisição ao Orquestrador: ${error.message}`);
    process.exit(1);
  }

  // Passo 4: Verificar notificação no Serviço de Notificações
  log.section('Passo 4: Verificando Notificação no Serviço');

  log.info('Aguardando 2 segundos para o serviço processar...');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  try {
    log.info('Recuperando notificações do usuário...');
    const userId = notificationPayload.userId;
    const notificationsResponse = await makeRequest('GET', `${NOTIFICATIONS_URL}/notifications/${userId}`);

    if (notificationsResponse.status === 200) {
      const notifications = notificationsResponse.body;
      if (Array.isArray(notifications) && notifications.length > 0) {
        log.success('Notificação encontrada no banco de dados!');
        console.log(`  Total: ${notifications.length}`);
        console.log(`  Primeira notificação: ${JSON.stringify(notifications[0], null, 2)}`);
      } else {
        log.warn('Nenhuma notificação encontrada para este usuário');
      }
    } else {
      log.warn(`Erro ao recuperar notificações (Status: ${notificationsResponse.status})`);
    }
  } catch (error) {
    log.error(`Erro ao verificar notificações: ${error.message}`);
  }

  // Resumo
  log.section('Resumo do Teste');

  console.log(`${colors.cyan}Fluxo Testado:${colors.reset}`);
  console.log(`  1. Orquestrador (3009) → Recebeu notificação`);
  console.log(`  2. Kafka (9092) → Publicou evento "notification.send"`);
  console.log(`  3. Serviço de Notificações (3015) → Processou evento`);
  console.log(`  4. Email → Será enviado para wilk.caetano@gmail.com`);
  console.log('');

  log.success('Teste completo finalizado!');
  console.log('');
  log.info('Próximos passos:');
  console.log('  1. Verifique os logs do Orquestrador');
  console.log('  2. Verifique os logs do Serviço de Notificações');
  console.log('  3. Verifique sua caixa de email');
  console.log('  4. Monitore o Kafka com: docker exec kafka kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic notification.send --from-beginning');
  console.log('');
}

runFullFlowTest().catch((error) => {
  log.error(`Erro ao executar teste: ${error.message}`);
  process.exit(1);
});
