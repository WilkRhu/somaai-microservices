import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UsersService } from './users.service';
import { UsersController, AdminUsersController } from './users.controller';
import { UserProfile } from './entities/user-profile.entity';
import { ImageUploadService } from './services/image-upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile]), HttpModule],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService, ImageUploadService],
  exports: [UsersService],
})
export class UsersModule {}
