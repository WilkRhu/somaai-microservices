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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SendEmailDto {
}
exports.SendEmailDto = SendEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'customer@example.com',
        description: 'Recipient email address',
    }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'cc@example.com',
        description: 'CC email address',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "cc", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'bcc@example.com',
        description: 'BCC email address',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "bcc", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Order Confirmation',
        description: 'Email subject',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'order-confirmation',
        description: 'Email template name',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendEmailDto.prototype, "template", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { orderNumber: 'ORD-001', totalAmount: 250.50 },
        description: 'Template variables',
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendEmailDto.prototype, "data", void 0);
//# sourceMappingURL=send-email.dto.js.map