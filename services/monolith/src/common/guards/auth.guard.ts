import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AuthValidationService } from '../services/auth-validation.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private authValidationService: AuthValidationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        this.logger.warn('Missing authorization header');
        throw new HttpException('Missing authorization header', HttpStatus.UNAUTHORIZED);
      }

      const token = this.authValidationService.extractTokenFromHeader(authHeader);

      if (!token) {
        this.logger.warn('Invalid authorization header format');
        throw new HttpException('Invalid authorization header format', HttpStatus.UNAUTHORIZED);
      }

      this.logger.debug(`Validating token: ${token.substring(0, 20)}...`);

      // Valida o token com o auth service
      const user = await this.authValidationService.validateToken(token);

      this.logger.debug(`Token validated, user data: ${JSON.stringify(user)}`);

      // Injeta o usuário no request
      request.user = user;

      this.logger.debug(`User injected in request: ${request.user?.id}`);

      return true;
    } catch (error) {
      this.logger.error(`Auth guard error: ${error.message}`);
      
      // Se já é uma HttpException, relança
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Caso contrário, cria uma nova
      throw new HttpException(
        error.message || 'Unauthorized',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
