import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async syncUserFromAuth(userData: any): Promise<User> {
    const { id, email, firstName, lastName, phone, avatar, authProvider, role, emailVerified } = userData;

    this.logger.log(`📝 Syncing user from auth: ${email}`);

    let user = await this.usersRepository.findOne({ where: { id } });

    if (user) {
      this.logger.log(`   - User already exists, updating...`);
      user.email = email;
      user.firstName = firstName;
      user.lastName = lastName;
      user.phone = phone;
      user.avatar = avatar;
      user.role = role;
      user.emailVerified = emailVerified;
      user = await this.usersRepository.save(user);
    } else {
      this.logger.log(`   - Creating new user...`);
      user = this.usersRepository.create({
        id, // auth service id used directly as PK
        email,
        firstName,
        lastName,
        phone,
        avatar,
        authProvider,
        role,
        emailVerified,
      });
      user = await this.usersRepository.save(user);
    }

    this.logger.log(`✅ User synced: ${user.id}`);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
}
