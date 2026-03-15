import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface ValidatedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
}

@Injectable()
export class AuthValidationService {
  private readonly logger = new Logger(AuthValidationService.name);

  constructor(private jwtService: JwtService) {}

  /**
   * Valida o JWT token localmente
   * Retorna os dados do usuário se válido
   */
  async validateToken(token: string): Promise<ValidatedUser> {
    try {
      this.logger.debug(`Validating token locally`);
      this.logger.debug(`Token: ${token.substring(0, 50)}...`);

      const decoded = this.jwtService.verify(token);

      this.logger.debug(`Token validated for user: ${decoded.id}`);

      return {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        isActive: decoded.isActive,
      };
    } catch (error) {
      this.logger.error(`Token validation failed: ${error.message}`);
      this.logger.error(`Error name: ${error.name}`);
      this.logger.error(`Error details:`, error);
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Obtém informações do usuário autenticado
   */
  async getCurrentUser(token: string): Promise<ValidatedUser> {
    try {
      this.logger.debug(`Getting current user from token`);

      const decoded = this.jwtService.verify(token);

      return {
        id: decoded.sub || decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        isActive: decoded.isActive,
      };
    } catch (error) {
      this.logger.error(`Failed to get current user: ${error.message}`);
      throw new HttpException('Failed to get user info', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Extrai o token do header Authorization
   */
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      this.logger.warn(`Invalid authorization header format: ${authHeader.substring(0, 20)}...`);
      return null;
    }

    return parts[1];
  }
}
