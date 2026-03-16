import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createOrUpdate(userData: any): Promise<User> {
    try {
      const { id, email, firstName, lastName, role, phone, avatar, isActive, emailVerified } = userData;

      let user = await this.usersRepository.findOne({ where: { id } });

      if (user) {
        // Update existing user
        user.email = email;
        user.firstName = firstName;
        user.lastName = lastName;
        user.role = role || user.role;
        user.phone = phone || user.phone;
        user.avatar = avatar || user.avatar;
        user.isActive = isActive !== undefined ? isActive : user.isActive;
        user.emailVerified = emailVerified !== undefined ? emailVerified : user.emailVerified;
        user.updatedAt = new Date();
      } else {
        // Create new user
        user = this.usersRepository.create({
          id,
          email,
          firstName,
          lastName,
          role: role || 'USER',
          phone,
          avatar,
          isActive: isActive !== undefined ? isActive : true,
          emailVerified: emailVerified !== undefined ? emailVerified : false,
        });
      }

      const savedUser = await this.usersRepository.save(user);
      this.logger.log(`User ${id} synced to business database`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error syncing user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
