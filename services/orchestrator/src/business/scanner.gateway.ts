import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/scanner',
  transports: ['websocket', 'polling'],
})
export class ScannerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ScannerGateway');
  private connectedClients = new Map<string, { type: string; userId: string }>();

  constructor(private httpService: HttpService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const type = client.handshake.query.type as string;

    this.connectedClients.set(client.id, { type, userId });

    this.logger.log(
      `Cliente conectado: ${client.id} (${type} - ${userId})`,
    );

    // Notifica todos sobre nova conexão
    this.server.emit('client-connected', {
      clientId: client.id,
      type,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    this.connectedClients.delete(client.id);

    this.logger.log(`Cliente desconectado: ${client.id}`);

    // Notifica todos sobre desconexão
    this.server.emit('client-disconnected', {
      clientId: client.id,
      type: clientInfo?.type,
      userId: clientInfo?.userId,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('scan')
  async handleScan(client: Socket, payload: any) {
    try {
      const clientInfo = this.connectedClients.get(client.id);

      this.logger.log(
        `Scan recebido de ${clientInfo?.userId}: ${payload.barcode}`,
      );

      // Faz proxy para o serviço business
      const businessServiceUrl = process.env.BUSINESS_SERVICE_URL || 'http://localhost:3011';
      
      try {
        const response = await firstValueFrom(
          this.httpService.post(
            `${businessServiceUrl}/scanner/process`,
            payload,
          ),
        );

        const result = response.data;

        // Envia resultado para o cliente que enviou
        client.emit('scan-result', result);

        // Broadcast para dashboard
        this.server.emit('scan-result', {
          ...result,
          fromDevice: clientInfo?.userId,
        });

        this.logger.log(
          `Scan processado: ${payload.barcode} - Produto ${result.product ? 'encontrado' : 'não encontrado'}`,
        );
      } catch (error) {
        this.logger.error(`Erro ao chamar business service: ${error.message}`);

        // Se o business service não responder, tenta processar localmente
        // ou retorna erro
        client.emit('scan-result', {
          success: false,
          barcode: payload.barcode,
          timestamp: payload.timestamp,
          product: null,
          error: 'Serviço indisponível',
        });
      }
    } catch (error) {
      this.logger.error(`Erro ao processar scan: ${error.message}`);

      client.emit('scan-result', {
        success: false,
        barcode: payload.barcode,
        timestamp: payload.timestamp,
        product: null,
        error: error.message,
      });
    }
  }

  // Método para enviar notificações para o dashboard
  notifyDashboard(event: string, data: any) {
    this.server.emit(event, data);
  }
}
