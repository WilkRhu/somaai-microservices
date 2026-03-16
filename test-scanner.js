const io = require('socket.io-client');

console.log('Testando conexão ao scanner...');
console.log('URL: http://localhost:3009/scanner');

const apiUrl = 'http://localhost:3009';
const userId = 'test-user-123';

const socket = io(`${apiUrl}/scanner`, {
  transports: ['websocket'], // WebSocket puro, sem polling (equivalente ao wss://)
  reconnectionAttempts: 3,
  query: {
    type: 'pdv',
    userId,
  },
});

socket.on('connect', () => {
  console.log('✓ Conectado ao scanner!');
  console.log('Socket ID:', socket.id);
  
  // Enviar um scan
  console.log('\nEnviando scan...');
  socket.emit('scan', {
    barcode: '7896259410133',
    timestamp: new Date().toISOString()
  });
});

socket.on('scan-result', (data) => {
  console.log('\n✓ Resultado recebido:');
  console.log(JSON.stringify(data, null, 2));
  
  if (data.product) {
    console.log(`✓ Produto encontrado: ${data.product.originalName}`);
  } else {
    console.log('✗ Produto não encontrado');
  }
  
  socket.disconnect();
  process.exit(0);
});

socket.on('client-connected', (data) => {
  console.log('✓ Evento client-connected recebido:', data);
});

socket.on('error', (error) => {
  console.error('✗ Erro:', error);
  socket.disconnect();
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('\nDesconectado');
});

socket.on('connect_error', (error) => {
  console.error('✗ Erro de conexão:', error.message);
});

// Timeout de 10 segundos
setTimeout(() => {
  console.error('\n✗ Timeout - nenhuma resposta recebida');
  socket.disconnect();
  process.exit(1);
}, 10000);
