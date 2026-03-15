import { createParamDecorator, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';

/**
 * Valida que o userId do parâmetro bate com o userId do token
 * Comparação case-insensitive para flexibilidade
 * Se não bater, lança erro 403 Forbidden
 * 
 * Uso: @ValidateUserId() @Param('userId') userId: string
 * Nota: Deve ser usado junto com @Param('userId')
 */
export const ValidateUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const logger = new Logger('ValidateUserId');
    const request = ctx.switchToHttp().getRequest();
    const tokenUserId = request.user?.id;
    
    // Extrair userId do request.params (vem da rota :userId)
    const paramUserId = request.params?.userId;

    logger.debug(`🔍 Validating userId: param=${paramUserId}, token=${tokenUserId}`);
    logger.debug(`   - request.params: ${JSON.stringify(request.params)}`);

    if (!tokenUserId) {
      logger.error(`❌ User not authenticated: request.user=${JSON.stringify(request.user)}`);
      throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
    }

    if (!paramUserId) {
      logger.error(`❌ UserId parameter not found in route`);
      logger.error(`   - request.params: ${JSON.stringify(request.params)}`);
      logger.error(`   - request.route: ${JSON.stringify(request.route)}`);
      throw new HttpException('UserId parameter missing', HttpStatus.BAD_REQUEST);
    }

    // Comparação case-insensitive
    if (paramUserId.toLowerCase() !== tokenUserId.toLowerCase()) {
      logger.error(`❌ UserId mismatch: param=${paramUserId}, token=${tokenUserId}`);
      throw new HttpException(
        'Cannot access another user\'s data',
        HttpStatus.FORBIDDEN,
      );
    }

    logger.debug(`✅ UserId validated successfully: ${paramUserId}`);
    return paramUserId;
  },
);
