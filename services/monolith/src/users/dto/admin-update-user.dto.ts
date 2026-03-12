import { IsOptional, IsString, IsEnum, IsEmail } from 'class-validator';
import { UserRole } from '../../shared/enums/user-role.enum';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;
}
