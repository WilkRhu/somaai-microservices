import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { KafkaService } from '../kafka/kafka.service';
import { MonolithSyncService } from '../common/services/monolith-sync.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private kafkaService: KafkaService,
    private monolithSyncService: MonolithSyncService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS || '10'),
    );

    // Create user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      authProvider: 'EMAIL',
      role: 'USER',
    });

    const savedUser = await this.usersRepository.save(user);

    // Sincronizar com monolith se não houver referência a business
    try {
      await this.monolithSyncService.syncUserToMonolith(savedUser);
      this.logger.log(`Synced user ${savedUser.id} to monolith`);
    } catch (error) {
      this.logger.error(`Failed to sync user to monolith: ${error.message}`);
      // Não falhar o registro se a sincronização falhar
    }

    // Publicar evento Kafka
    try {
      await this.kafkaService.publishUserCreated(savedUser);
      await this.kafkaService.publishRegistrationSuccess(savedUser);
      this.logger.log(`Published user.created event for user: ${savedUser.id}`);
    } catch (error) {
      this.logger.error(`Failed to publish Kafka event for user creation: ${error.message}`);
      // Não falhar o registro se o Kafka falhar
    }

    // Generate tokens
    const tokens = this.generateTokens(savedUser);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        isActive: savedUser.isActive,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Publicar evento de falha de login
      try {
        await this.kafkaService.publishLoginFailed(email, 'User not found');
      } catch (error) {
        this.logger.error(`Failed to publish login failed event: ${error.message}`);
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Publicar evento de falha de login
      try {
        await this.kafkaService.publishLoginFailed(email, 'Invalid password');
      } catch (error) {
        this.logger.error(`Failed to publish login failed event: ${error.message}`);
      }
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.usersRepository.save(user);

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Publicar evento de login bem-sucedido
    try {
      await this.kafkaService.publishLoginSuccess(user);
    } catch (error) {
      this.logger.error(`Failed to publish login success event: ${error.message}`);
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
    };
  }

  async googleLogin(googleLoginDto: GoogleLoginDto): Promise<AuthResponseDto> {
    const { email, firstName, lastName, avatar, idToken, role } = googleLoginDto;

    // Verify Google ID token (in production, verify with Google API)
    if (!idToken) {
      throw new BadRequestException('Invalid Google ID token');
    }

    // Check if user exists
    let user = await this.usersRepository.findOne({
      where: { email },
    });

    const isNewUser = !user;

    if (user) {
      // User exists, update Google ID if not set
      if (!user.googleId) {
        user.googleId = idToken;
        user.authProvider = 'GOOGLE';
      }
      
      // Update last login
      user.lastLogin = new Date();
      user = await this.usersRepository.save(user);
    } else {
      // Create new user
      user = this.usersRepository.create({
        email,
        firstName,
        lastName,
        avatar,
        googleId: idToken,
        authProvider: 'GOOGLE',
        role: role || 'USER',
        emailVerified: true, // Google users are already verified
      });

      user = await this.usersRepository.save(user);

      // Sincronizar novo usuário com monolith
      try {
        await this.monolithSyncService.syncUserToMonolith(user);
        this.logger.log(`Synced Google user ${user.id} to monolith`);
      } catch (error) {
        this.logger.error(`Failed to sync Google user to monolith: ${error.message}`);
        // Não falhar o login se a sincronização falhar
      }
    }

    // Publicar eventos Kafka
    try {
      if (isNewUser) {
        await this.kafkaService.publishUserCreated(user);
        await this.kafkaService.publishRegistrationSuccess(user);
        this.logger.log(`Published user.created event for Google user: ${user.id}`);
      }
      await this.kafkaService.publishLoginSuccess(user);
    } catch (error) {
      this.logger.error(`Failed to publish Kafka events for Google login: ${error.message}`);
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async validateJwt(payload: JwtPayload): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: payload.sub },
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = this.generateTokens(user);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const expiration = process.env.JWT_EXPIRATION || '3600s';
    const refreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '604800s';

    // Ensure numeric-only values get 's' suffix (e.g. "3600" -> "3600s")
    const accessExpiry = /^\d+$/.test(expiration) ? `${expiration}s` : expiration;
    const refreshExpiry = /^\d+$/.test(refreshExpiration) ? `${refreshExpiration}s` : refreshExpiration;

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: accessExpiry,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: refreshExpiry,
    });

    return { accessToken, refreshToken };
  }
}
