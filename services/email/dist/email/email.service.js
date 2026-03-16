"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const Handlebars = __importStar(require("handlebars"));
const sendgrid_service_1 = require("./services/sendgrid.service");
const smtp_service_1 = require("./services/smtp.service");
const template_loader_1 = require("./templates/template-loader");
const email_status_enum_1 = require("./enums/email-status.enum");
let EmailService = class EmailService {
    constructor(sendgridService, smtpService) {
        this.sendgridService = sendgridService;
        this.smtpService = smtpService;
        this.emailStorage = new Map();
        this.templateLoader = new template_loader_1.TemplateLoader();
    }
    async sendEmail(dto) {
        try {
            let htmlContent;
            let textContent;
            // Try to load from built-in templates first
            const builtInTemplate = this.templateLoader.getTemplate(dto.template, dto.data);
            if (builtInTemplate) {
                htmlContent = builtInTemplate;
                textContent = undefined;
            }
            else {
                throw new common_1.HttpException('Template not found', common_1.HttpStatus.NOT_FOUND);
            }
            const emailId = this.generateId();
            const email = {
                id: emailId,
                to: dto.to,
                cc: dto.cc,
                bcc: dto.bcc,
                subject: dto.subject,
                htmlContent,
                textContent,
                status: email_status_enum_1.EmailStatus.PENDING,
                opens: 0,
                clicks: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.emailStorage.set(emailId, email);
            try {
                const result = await this.sendgridService.sendEmail(dto.to, dto.subject, htmlContent, textContent, dto.cc, dto.bcc);
                email.status = email_status_enum_1.EmailStatus.SENT;
                email.sentAt = new Date();
                email.updatedAt = new Date();
            }
            catch (error) {
                try {
                    const result = await this.smtpService.sendEmail(dto.to, dto.subject, htmlContent, textContent, dto.cc, dto.bcc);
                    email.status = email_status_enum_1.EmailStatus.SENT;
                    email.sentAt = new Date();
                    email.updatedAt = new Date();
                }
                catch (smtpError) {
                    email.status = email_status_enum_1.EmailStatus.FAILED;
                    email.updatedAt = new Date();
                }
            }
            return {
                id: email.id,
                to: email.to,
                subject: email.subject,
                status: email.status,
                sentAt: email.sentAt,
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to send email: ${error instanceof Error ? error.message : String(error)}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async sendBulkEmail(dto) {
        try {
            let htmlContent;
            let textContent;
            // Try to load from built-in templates first
            const builtInTemplate = this.templateLoader.getTemplate(dto.template, dto.data);
            if (builtInTemplate) {
                htmlContent = builtInTemplate;
                textContent = undefined;
            }
            else {
                throw new common_1.HttpException('Template not found', common_1.HttpStatus.NOT_FOUND);
            }
            try {
                await this.sendgridService.sendBulk(dto.recipients, dto.subject, htmlContent, textContent);
            }
            catch (error) {
                await this.smtpService.sendBulk(dto.recipients, dto.subject, htmlContent, textContent);
            }
            for (const recipient of dto.recipients) {
                const emailId = this.generateId();
                const email = {
                    id: emailId,
                    to: recipient,
                    subject: dto.subject,
                    htmlContent,
                    textContent,
                    status: email_status_enum_1.EmailStatus.SENT,
                    sentAt: new Date(),
                    opens: 0,
                    clicks: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                this.emailStorage.set(emailId, email);
            }
            return {
                recipientCount: dto.recipients.length,
                status: 'queued',
                createdAt: new Date(),
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to send bulk email: ${error instanceof Error ? error.message : String(error)}`, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getEmailStatus(id) {
        const email = this.emailStorage.get(id);
        if (!email) {
            throw new common_1.HttpException('Email not found', common_1.HttpStatus.NOT_FOUND);
        }
        return {
            id: email.id,
            to: email.to,
            subject: email.subject,
            status: email.status,
            sentAt: email.sentAt,
            deliveredAt: email.deliveredAt,
            opens: email.opens,
            clicks: email.clicks,
        };
    }
    renderTemplate(template, data) {
        const compiled = Handlebars.compile(template);
        return compiled(data);
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sendgrid_service_1.SendgridService,
        smtp_service_1.SmtpService])
], EmailService);
//# sourceMappingURL=email.service.js.map