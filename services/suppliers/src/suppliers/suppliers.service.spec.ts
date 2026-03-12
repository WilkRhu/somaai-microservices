import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SuppliersService } from './suppliers.service';
import { SupplierEntity } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { mockRepository } from '../../../test/mocks/database.mock';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: getRepositoryToken(SupplierEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
  });

  afterEach(async () => {
    await module.close();
    jest.clearAllMocks();
  });

  describe('createSupplier', () => {
    it('should create a supplier', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Supplier ABC',
        email: 'supplier@example.com',
        phone: '+55 11 98765-4321',
        address: 'Rua Principal, 123',
      };

      const expectedSupplier = {
        id: 'supp-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedSupplier);
      mockRepository.save.mockResolvedValue(expectedSupplier);

      const result = await service.createSupplier(createDto);

      expect(result).toEqual(expectedSupplier);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw error when email is invalid', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Supplier ABC',
        email: 'invalid-email',
        phone: '+55 11 98765-4321',
        address: 'Rua Principal, 123',
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error('Invalid email format');
      });

      await expect(service.createSupplier(createDto)).rejects.toThrow(
        'Invalid email format',
      );
    });
  });

  describe('getSupplier', () => {
    it('should retrieve a supplier by id', async () => {
      const supplierId = 'supp-123';
      const expectedSupplier = {
        id: supplierId,
        name: 'Supplier ABC',
        email: 'supplier@example.com',
        phone: '+55 11 98765-4321',
        address: 'Rua Principal, 123',
      };

      mockRepository.findOne.mockResolvedValue(expectedSupplier);

      const result = await service.getSupplier(supplierId);

      expect(result).toEqual(expectedSupplier);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: supplierId },
      });
    });

    it('should return null when supplier not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getSupplier('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('listSuppliers', () => {
    it('should list all suppliers', async () => {
      const expectedSuppliers = [
        {
          id: 'supp-1',
          name: 'Supplier A',
          email: 'a@example.com',
          phone: '+55 11 98765-4321',
          address: 'Rua A, 123',
        },
        {
          id: 'supp-2',
          name: 'Supplier B',
          email: 'b@example.com',
          phone: '+55 11 98765-4322',
          address: 'Rua B, 456',
        },
      ];

      mockRepository.find.mockResolvedValue(expectedSuppliers);

      const result = await service.listSuppliers();

      expect(result).toEqual(expectedSuppliers);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('updateSupplier', () => {
    it('should update a supplier', async () => {
      const supplierId = 'supp-123';
      const updateData = { phone: '+55 11 99999-9999' };

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateSupplier(supplierId, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(supplierId, updateData);
    });
  });

  describe('deleteSupplier', () => {
    it('should delete a supplier', async () => {
      const supplierId = 'supp-123';

      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.deleteSupplier(supplierId);

      expect(mockRepository.delete).toHaveBeenCalledWith(supplierId);
    });
  });

  describe('getSupplierByEmail', () => {
    it('should find supplier by email', async () => {
      const email = 'supplier@example.com';
      const expectedSupplier = {
        id: 'supp-123',
        name: 'Supplier ABC',
        email,
        phone: '+55 11 98765-4321',
        address: 'Rua Principal, 123',
      };

      mockRepository.findOneBy.mockResolvedValue(expectedSupplier);

      const result = await service.getSupplierByEmail(email);

      expect(result).toEqual(expectedSupplier);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email });
    });
  });
});
