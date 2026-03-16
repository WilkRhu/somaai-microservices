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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendgridService = void 0;
const common_1 = require("@nestjs/common");
const mail_1 = __importDefault(require("@sendgrid/mail"));
let SendgridService = class SendgridService {
    constructor() {
        mail_1.default.setApiKey(process.env.SENDGRID_API_KEY || '');
    }
    async sendEmail(to, subject, htmlContent, textContent, cc, bcc) {
        try {
            const msg = {
                to,
                from: process.env.SMTP_FROM || 'noreply@somaai.com',
                subject,
                html: htmlContent,
                text: textContent,
            };
            if (cc)
                msg.cc = cc;
            if (bcc)
                msg.bcc = bcc;
            const response = await mail_1.default.send(msg);
            return {
                id: response[0].headers['x-message-id'] || 'unknown',
                status: 'sent',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`SendGrid error: ${error instanceof Error ? error.message : String(error)}`, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async sendBulk(recipients, subject, htmlContent, textContent) {
        try {
            const msg = {
                to: recipients,
                from: process.env.SMTP_FROM || 'noreply@somaai.com',
                subject,
                html: htmlContent,
                text: textContent,
            };
            await mail_1.default.sendMultiple(msg);
            return {
                count: recipients.length,
                status: 'queued',
            };
        }
        catch (error) {
            throw new common_1.HttpException(`SendGrid bulk error: ${error instanceof Error ? error.message : String(error)}`, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.SendgridService = SendgridService;
exports.SendgridService = SendgridService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SendgridService);
//# sourceMappingURL=sendgrid.service.js.map