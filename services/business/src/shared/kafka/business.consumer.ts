import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Establishment } from '../../establishments/entities/establishment.entity';
import { EstablishmentUser } from '../entities/establishment-user.entity';
import { UserService } from '../services/user.service';

@Injectable()
export class BusinessConsumer {
  private readonly logger = new Logger(BusinessConsumer.name);

  constructor(
    @InjectRepository(Establishment)
    private establishmentsRepository: Repository<Establishment>,
    @InjectRepository(EstablishmentUser)
    private establishmentUsersRepository: Repository<EstablishmentUser>,
    private userService: UserService,
  ) {}

  async handleUserCreated(message: any) {
    try {
      const { id: userId, role, email, firstName, lastName } = message;

      this.logger.log(`Processing user.created event for user: ${userId}`);

      // Sync user to business database
      try {
        await this.userService.createOrUpdate({
          id: userId,
          email,
          firstName,
          lastName,
          role,
        });
        this.logger.log(`User ${userId} synced to business database`);
      } catch (error) {
        this.logger.error(`Failed to sync user to business database: ${error.message}`);
        // Don't fail the whole process if user sync fails
      }

      // Only create establishment for BUSINESS_OWNER users
      if (role !== 'business_owner') {
        this.logger.debug(`User ${userId} is not a BUSINESS_OWNER, skipping establishment creation`);
        return;
      }

      this.logger.log(`Creating establishment for BUSINESS_OWNER user: ${userId}`);

      // Check if establishment already exists for this user
      const existingEstablishment = await this.establishmentsRepository.findOne({
        where: { ownerId: userId },
      });

      if (existingEstablishment) {
        this.logger.warn(`Establishment already exists for user ${userId}`);
        return;
      }

      // Create default establishment
      const establishment = this.establishmentsRepository.create({
        id: uuidv4(),
        ownerId: userId,
        name: `${firstName} ${lastName}'s Business`,
        email,
        isActive: true,
      });

      const savedEstablishment = await this.establishmentsRepository.save(establishment);
      this.logger.log(`Establishment created successfully for user ${userId}: ${savedEstablishment.id}`);

      // Create establishment_user record with OWNER role
      try {
        const establishmentUser = this.establishmentUsersRepository.create({
          id: uuidv4(),
          establishmentId: savedEstablishment.id,
          userId,
          role: 'business_owner',
          status: 'ACTIVE',
          acceptedAt: new Date(),
        });

        await this.establishmentUsersRepository.save(establishmentUser);
        this.logger.log(`EstablishmentUser created for user ${userId} with role business_owner`);
      } catch (error) {
        this.logger.error(`Failed to create establishment_user: ${error.message}`);
        // Don't fail - establishment was created successfully
      }
    } catch (error) {
      this.logger.error(`Error handling user.created event: ${error.message}`, error.stack);
      // Don't throw - we don't want to fail the Kafka consumer
    }
  }

  async handleUserUpdated(message: any) {
    try {
      const { id: userId } = message;

      this.logger.log(`Processing user.updated event for user: ${userId}`);

      // Sync updated user to business database
      await this.userService.createOrUpdate(message);
      this.logger.log(`User ${userId} updated in business database`);
    } catch (error) {
      this.logger.error(`Error handling user.updated event: ${error.message}`, error.stack);
    }
  }
}
