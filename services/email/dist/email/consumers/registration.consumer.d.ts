import { OnModuleInit } from '@nestjs/common';
import { EmailService } from '../email.service';
import { KafkaService } from '../../kafka/kafka.service';
export declare class RegistrationConsumer implements OnModuleInit {
    private kafkaService;
    private emailService;
    private readonly logger;
    constructor(kafkaService: KafkaService, emailService: EmailService);
    onModuleInit(): Promise<void>;
    /**
     * Manipula evento de registro bem-sucedido
     */
    private handleRegistrationSuccess;
    /**
     * Manipula evento de usuário criado
     */
    private handleUserCreated;
}
//# sourceMappingURL=registration.consumer.d.ts.map