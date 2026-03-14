import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UsersService } from './users.service';
import { UsersController, AdminUsersController, UsersInternalController } from './users.controller';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { ImageUploadService } from './services/image-upload.service';
import { UserSyncService } from './services/user-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile]), HttpModule],
  controllers: [UsersController, AdminUsersController, UsersInternalController],
  providers: [UsersService, ImageUploadService, UserSyncService],
  exports: [UsersService, UserSyncService],
})
export class UsersModule {}
