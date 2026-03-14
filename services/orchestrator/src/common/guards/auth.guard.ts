import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

/**
 * Guard simples que apenas valida se o token existe
 * Não valida com auth service (deixa para o serviço chamado fazer isso)
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new HttpException('Missing authorization header', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}
