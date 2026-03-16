import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';

/**
 * Guard simples que apenas valida se o token existe
 * A validação real do JWT é feita pelo serviço de destino
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const method = request.method;
    const url = request.url;
    const allHeaders = request.headers;

    this.logger.log(`📋 [AUTH GUARD] ${method} ${url}`);
    this.logger.log(`📋 [AUTH GUARD] All headers:`, JSON.stringify(allHeaders, null, 2));
    this.logger.log(`📋 [AUTH GUARD] Authorization header: ${authHeader || 'MISSING'}`);

    if (!authHeader) {
      this.logger.error(`❌ [AUTH GUARD] Missing authorization header for ${method} ${url}`);
      throw new HttpException('Missing authorization header', HttpStatus.UNAUTHORIZED);
    }

    // Extract token from "Bearer <token>"
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      this.logger.error(`❌ [AUTH GUARD] Invalid authorization header format: ${authHeader}`);
      throw new HttpException('Invalid authorization header format', HttpStatus.UNAUTHORIZED);
    }

    const token = tokenParts[1];
    this.logger.log(`✅ [AUTH GUARD] Token found: ${token.substring(0, 20)}...`);

    return true;
  }
}
