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
        throw new HttpException('Missing authorization header', HttpStatus.UNAUTHORIZED);
      }

      const token = this.authValidationService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new HttpException('Invalid authorization header format', HttpStatus.UNAUTHORIZED);
      }

      const user = await this.authValidationService.validateToken(token);
      request.user = user;

      this.logger.debug(`User authenticated: ${user.id}`);

      return true;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(error.message || 'Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
