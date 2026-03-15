import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { OnboardingDto, OnboardingStatusDto } from './dto/onboarding.dto';
import { UserStatsDto } from './dto/user-stats.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ImageUploadService } from './services/image-upload.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { isActive: true } });
    
    // Users created this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :startOfMonth', { startOfMonth: thisMonth })
      .getCount();

    // Users created this week
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    thisWeek.setHours(0, 0, 0, 0);
    
    const newUsersThisWeek = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :startOfWeek', { startOfWeek: thisWeek })
      .getCount();

    // Users by role - initialize with default values
    const usersByRoleMap = {
      user: 0,
      admin: 0,
      support: 0,
      super_admin: 0,
    };

    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    usersByRole.forEach((row) => {
      const roleKey = row.role.toLowerCase();
      if (roleKey in usersByRoleMap) {
        usersByRoleMap[roleKey] = parseInt(row.count, 10);
      }
    });

    // Users by plan - initialize with default values
    const usersByPlanMap = {
      free: 0,
      premium: 0,
      enterprise: 0,
    };

    const usersByPlan = await this.userRepository
      .createQueryBuilder('user')
      .select('user.planType', 'planType')
      .addSelect('COUNT(*)', 'count')
      .where('user.planType IS NOT NULL')
      .groupBy('user.planType')
      .getRawMany();

    usersByPlan.forEach((row) => {
      const planKey = row.planType.toLowerCase();
      if (planKey in usersByPlanMap) {
        usersByPlanMap[planKey] = parseInt(row.count, 10);
      }
    });

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      usersByRole: usersByRoleMap,
      usersByPlan: usersByPlanMap,
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
