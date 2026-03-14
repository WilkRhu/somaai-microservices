import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { OnboardingDto, OnboardingStatusDto } from './dto/onboarding.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ImageUploadService } from './services/image-upload.service';

@Injectable()
export class UsersService {
  constructor(
    private httpService: HttpService,
    private imageUploadService: ImageUploadService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      let profileImageUrl: string | null = null;

      // Upload profile image if provided
      if (createUserDto.profileImage) {
        profileImageUrl = await this.imageUploadService.uploadProfileImage(
          createUserDto.profileImage,
          'new-user',
        );
      }

      // Split name into firstName and lastName if needed
      const nameParts = createUserDto.name?.split(' ') || ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const userPayload = {
        email: createUserDto.email,
        password: createUserDto.password,
        firstName,
        lastName,
        phone: createUserDto.phone,
        profileImageUrl,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.AUTH_SERVICE_URL}/api/auth/register`,
          userPayload,
        ),
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to create user', HttpStatus.BAD_REQUEST);
    }
  }

  async listUsers(skip: number = 0, take: number = 20): Promise<UserResponseDto[]> {
    // Mock implementation - would call Auth Service or database
    return [
      {
        id: '1',
        email: 'user1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async listUsersWithFilter(
    skip: number = 0,
    take: number = 20,
    role?: string,
  ): Promise<UserResponseDto[]> {
    // Mock implementation - would filter by role
    return this.listUsers(skip, take);
  }

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
    try {
      let profileImageUrl: string | null = null;

      // Upload profile image if provided
      if (updateUserDto.profileImage) {
        profileImageUrl = await this.imageUploadService.uploadProfileImage(
          updateUserDto.profileImage,
          userId,
        );
      }

      const userPayload = {
        email: updateUserDto.email,
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        phone: updateUserDto.phone,
        address: updateUserDto.address,
        city: updateUserDto.city,
        state: updateUserDto.state,
        zipCode: updateUserDto.zipCode,
        bio: updateUserDto.bio,
        avatar: profileImageUrl || updateUserDto.avatar,
      };

      // This would typically call the Auth Service or update local profile
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
        avatar: profileImageUrl || updateUserDto.avatar,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to update user: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async adminUpdateUser(
    userId: string,
    updateUserDto: AdminUpdateUserDto,
  ): Promise<UserResponseDto> {
    // Admin can update role and other fields
    return {
      id: userId,
      email: updateUserDto.email || 'user@example.com',
      firstName: updateUserDto.name?.split(' ')[0] || 'John',
      lastName: updateUserDto.name?.split(' ')[1] || 'Doe',
      isActive: true,
      phone: updateUserDto.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async deleteUser(userId: string): Promise<void> {
    // Mock implementation - would delete from database
    return;
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<UserResponseDto> {
    return {
      id: userId,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      avatar: avatarUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getOnboardingStatus(userId: string): Promise<OnboardingStatusDto> {
    return {
      completed: false,
      steps: {
        profileComplete: true,
        addressComplete: false,
        cardComplete: false,
        onboardingComplete: false,
      },
    };
  }

  async getUserPurchases(userId: string, skip: number = 0, take: number = 20): Promise<any> {
    // This would typically call the Purchases Service or query the database
    // For now, returning mock data
    return {
      items: [],
      total: 0,
      skip,
      take,
    };
  }

  async completeOnboarding(userId: string, onboardingDto: OnboardingDto): Promise<void> {
    // Mock implementation - would update user profile
    return;
  }

  async getUserStats(): Promise<UserStatsDto> {
    return {
      totalUsers: 1000,
      activeUsers: 750,
      newUsersThisMonth: 150,
      newUsersThisWeek: 35,
      usersByRole: {
        user: 950,
        admin: 40,
        support: 8,
        super_admin: 2,
      },
      usersByPlan: {
        free: 600,
        premium: 350,
        enterprise: 50,
      },
    };
  }

  async updateUserRole(userId: string, role: string): Promise<UserResponseDto> {
    return {
      id: userId,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getUserProfile(userId: string): Promise<UserResponseDto> {
    return this.getUserById(userId);
  }
}
