export class SyncFromAuthDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  authProvider: string;
  role: string;
  emailVerified: boolean;
}
