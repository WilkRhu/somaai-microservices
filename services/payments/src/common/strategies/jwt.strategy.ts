// Passport-free JWT validation — handled directly by JwtAuthGuard
export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}
