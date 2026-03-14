import { createParamDecorator, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';

/**
 * Valida que o userId do parâmetro bate com o userId do token
 * Comparação case-insensitive para flexibilidade
 * Se não bater, lança erro 403 Forbidden
 * 
 * Uso: @ValidateUserId('userId') userId: string
 */
export const ValidateUserId = createParamDecorator(
  (paramName: string, ctx: ExecutionContext) => {
    const logger = new Logger('ValidateUserId');
    const request = ctx.switchToHttp().getRequest();
    const tokenUserId = request.user?.id;
    const paramUserId = request.params[paramName];

    logger.debug(`Validating userId: param=${paramUserId}, token=${tokenUserId}`);

    if (!tokenUserId) {
      logger.error(`User not authenticated: request.user=${JSON.stringify(request.user)}`);
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    // Comparação case-insensitive
    if (paramUserId?.toLowerCase() !== tokenUserId?.toLowerCase()) {
      logger.error(`UserId mismatch: param=${paramUserId}, token=${tokenUserId}`);
      throw new HttpException(
        'Cannot access another user\'s data',
        HttpStatus.FORBIDDEN,
      );
    }

    return paramUserId;
  },
);
