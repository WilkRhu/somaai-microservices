import { Injectable, NestMiddleware, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthValidationService } from '../services/auth-validation.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(private authValidationService: AuthValidationService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new HttpException('Missing authorization header', HttpStatus.UNAUTHORIZED);
      }

      const token = this.authValidationService.extractTokenFromHeader(authHeader);

      if (!token) {
        throw new HttpException('Invalid authorization header format', HttpStatus.UNAUTHORIZED);
      }

      // Valida o token com o auth service
      const user = await this.authValidationService.validateToken(token);

      // Injeta o usuário no request
      req.user = user;

      next();
    } catch (error) {
      this.logger.error(`Auth middleware error: ${error.message}`);
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
