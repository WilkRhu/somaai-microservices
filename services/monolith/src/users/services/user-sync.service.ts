import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { SyncFromAuthDto } from '../dto/sync-from-auth.dto';

@Injectable()
export class UserSyncService {
  private readonly logger = new Logger(UserSyncService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Sincroniza um usuário criado no auth com o monolith
   * Se o usuário não existir, cria um novo com o mesmo ID do auth
   * Se existir com email placeholder, atualiza para o email real
   */
  async syncUserFromAuth(syncDto: SyncFromAuthDto): Promise<User> {
    try {
      // Verificar se o usuário já existe
      let user = await this.usersRepository.findOne({
        where: { id: syncDto.id },
      });

      if (user) {
        this.logger.log(`User ${syncDto.id} already exists in monolith, updating...`);
        
        // Se o email atual é um placeholder, atualizar para o email real
        const isPlaceholder = user.email.startsWith('placeholder-') && user.email.endsWith('@system.local');
        
        if (isPlaceholder && syncDto.email !== user.email) {
          this.logger.log(`   - Updating placeholder email from ${user.email} to ${syncDto.email}`);
        }
        
        // Atualizar dados
        user.email = syncDto.email;
        user.firstName = syncDto.firstName;
        user.lastName = syncDto.lastName;
        user.phone = syncDto.phone || user.phone;
        user.avatar = syncDto.avatar || user.avatar;
        user.authProvider = syncDto.authProvider;
        user.role = syncDto.role;
        user.emailVerified = syncDto.emailVerified;
        
        return await this.usersRepository.save(user);
      }

      // Criar novo usuário com o mesmo ID do auth
      user = this.usersRepository.create({
        id: syncDto.id,
        email: syncDto.email,
        firstName: syncDto.firstName,
        lastName: syncDto.lastName,
        phone: syncDto.phone,
        avatar: syncDto.avatar,
        authProvider: syncDto.authProvider,
        role: syncDto.role,
        emailVerified: syncDto.emailVerified,
        isActive: true,
      });

      const savedUser = await this.usersRepository.save(user);
      this.logger.log(`Successfully synced user ${syncDto.id} from auth to monolith`);
      return savedUser;
    } catch (error) {
      this.logger.error(`Error syncing user from auth: ${error.message}`);
      this.logger.error(`Error details:`, error);
      throw error;
    }
  }

  /**
   * Verifica se um usuário existe no monolith
   */
  async checkUserExists(userId: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    return !!user;
  }

  /**
   * Obtém um usuário pelo ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    return user;
  }
}
