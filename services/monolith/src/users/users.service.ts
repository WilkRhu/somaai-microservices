import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private httpService: HttpService) {}

  async getUserById(userId: string): Promise<UserResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${process.env.AUTH_SERVICE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${userId}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // This would typically call the Auth Service or update local profile
    // For now, returning a mock response
    return {
      id: userId,
      email: updateUserDto.email || 'user@example.com',
      firstName: updateUserDto.firstName || 'John',
      lastName: updateUserDto.lastName || 'Doe',
      isActive: true,
      phone: updateUserDto.phone,
      address: updateUserDto.address,
      city: updateUserDto.city,
      state: updateUserDto.state,
      zipCode: updateUserDto.zipCode,
      bio: updateUserDto.bio,
      avatar: updateUserDto.avatar,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getUserProfile(userId: string): Promise<UserResponseDto> {
    return this.getUserById(userId);
  }
}
