import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Establishment } from './entities/establishment.entity';
import { EstablishmentUser } from '../shared/entities/establishment-user.entity';
import { User } from '../shared/entities/user.entity';

@Injectable()
export class EstablishmentsService {
  private readonly logger = new Logger(EstablishmentsService.name);

  constructor(
    @InjectRepository(Establishment)
    private establishmentsRepository: Repository<Establishment>,
    @InjectRepository(EstablishmentUser)
    private establishmentUsersRepository: Repository<EstablishmentUser>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createEstablishmentDto: any, userId: string) {
    try {
      this.logger.log(`Creating establishment for user: ${userId}`);

      // Get user to check current role
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Create establishment
      const establishment = this.establishmentsRepository.create({
        id: uuidv4(),
        ownerId: userId,
        name: createEstablishmentDto.name,
        cnpj: createEstablishmentDto.cnpj,
        email: createEstablishmentDto.email,
        phone: createEstablishmentDto.phone,
        address: createEstablishmentDto.address,
        city: createEstablishmentDto.city,
        state: createEstablishmentDto.state,
        zipCode: createEstablishmentDto.zipCode,
        isActive: true,
      });

      const savedEstablishment = await this.establishmentsRepository.save(establishment);
      this.logger.log(`Establishment created: ${savedEstablishment.id}`);

      // Create establishment_user record with business_owner role
      const establishmentUser = this.establishmentUsersRepository.create({
        id: uuidv4(),
        establishmentId: savedEstablishment.id,
        userId,
        role: 'business_owner',
        status: 'ACTIVE',
        acceptedAt: new Date(),
      });

      await this.establishmentUsersRepository.save(establishmentUser);
      this.logger.log(`EstablishmentUser created with role business_owner`);

      // Update user role to business_owner if not already
      if (user.role !== 'business_owner') {
        user.role = 'business_owner';
        await this.usersRepository.save(user);
        this.logger.log(`User ${userId} role updated to business_owner`);
      }

      return savedEstablishment;
    } catch (error) {
      this.logger.error(`Error creating establishment: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll() {
    return this.establishmentsRepository.find();
  }

  async findOne(id: string) {
    return this.establishmentsRepository.findOne({ where: { id } });
  }

  async findByOwnerId(ownerId: string) {
    return this.establishmentsRepository.find({ where: { ownerId } });
  }

  async update(id: string, updateEstablishmentDto: any) {
    await this.establishmentsRepository.update(id, updateEstablishmentDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.establishmentsRepository.delete(id);
  }
}
