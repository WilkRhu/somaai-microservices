"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RegistrationConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationConsumer = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("../email.service");
const kafka_service_1 = require("../../kafka/kafka.service");
let RegistrationConsumer = RegistrationConsumer_1 = class RegistrationConsumer {
    constructor(kafkaService, emailService) {
        this.kafkaService = kafkaService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(RegistrationConsumer_1.name);
    }
    async onModuleInit() {
        try {
            // Escutar eventos de registro bem-sucedido
            await this.kafkaService.subscribeToTopic('auth.registration.success', this.handleRegistrationSuccess.bind(this));
            this.logger.log('Registered consumer for auth.registration.success topic');
            // Escutar eventos de usuário criado
            await this.kafkaService.subscribeToTopic('user.created', this.handleUserCreated.bind(this));
            this.logger.log('Registered consumer for user.created topic');
        }
        catch (error) {
            this.logger.error(`Failed to register Kafka consumers: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Manipula evento de registro bem-sucedido
     */
    async handleRegistrationSuccess(message) {
        try {
            this.logger.log(`Processing registration success event for user: ${message.userId}`);
            const { userId, email } = message;
            // Enviar email de boas-vindas
            await this.emailService.sendEmail({
                to: email,
                subject: 'Bem-vindo ao SomaAI!',
                template: 'user-welcome',
                data: {
                    userName: email,
                },
            });
            this.logger.log(`Welcome email sent successfully to ${email}`);
        }
        catch (error) {
            this.logger.error(`Error handling registration success event: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Manipula evento de usuário criado
     */
    async handleUserCreated(message) {
        try {
            this.logger.log(`Processing user created event for user: ${message.id}`);
            const { id, email, name } = message;
            // Enviar email de boas-vindas usando o template disponível
            await this.emailService.sendEmail({
                to: email,
                subject: 'Bem-vindo ao SomaAI!',
                template: 'user-welcome',
                data: {
                    userName: name || email,
                },
            });
            this.logger.log(`Welcome email sent successfully to ${email}`);
        }
        catch (error) {
            this.logger.error(`Error handling user created event: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
exports.RegistrationConsumer = RegistrationConsumer;
exports.RegistrationConsumer = RegistrationConsumer = RegistrationConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kafka_service_1.KafkaService,
        email_service_1.EmailService])
], RegistrationConsumer);
//# sourceMappingURL=registration.consumer.js.map