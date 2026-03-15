#!/usr/bin/env node

const { Kafka } = require('kafkajs');

const KAFKA_BROKERS = ['localhost:9092'];

async function testKafka() {
  console.log('🔍 Testando conexão direta com Kafka...\n');

  const kafka = new Kafka({
    clientId: 'test-client',
    brokers: KAFKA_BROKERS,
  });

  const producer = kafka.producer();
  const consumer = kafka.consumer({ groupId: 'test-group-' + Date.now() });

  try {
    console.log('📤 Conectando producer...');
    await producer.connect();
    console.log('✅ Producer conectado\n');

    console.log('📨 Publicando mensagem de teste...');
    const result = await producer.send({
      topic: 'notification.send',
      messages: [
        {
          key: 'test-key',
          value: JSON.stringify({
            userId: '7eb13a32-c3eb-4c70-bad4-ff66b07fe67f',
            type: 'EMAIL',
            title: 'Teste Direto',
            message: 'Mensagem de teste direto no Kafka',
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log('✅ Mensagem publicada:', result);
    console.log('');

    console.log('📥 Conectando consumer...');
    await consumer.connect();
    console.log('✅ Consumer conectado\n');

    console.log('👂 Aguardando mensagens...');
    let messageReceived = false;

    const timeout = setTimeout(() => {
      console.log('⏱️  Timeout - nenhuma mensagem recebida em 5 segundos');
      process.exit(1);
    }, 5000);

    await consumer.subscribe({ topic: 'notification.send', fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        clearTimeout(timeout);
        messageReceived = true;
        console.log('✅ Mensagem recebida!');
        console.log('  Topic:', topic);
        console.log('  Partition:', partition);
        console.log('  Value:', message.value.toString());
        process.exit(0);
      },
    });
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

testKafka();
