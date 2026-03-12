import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SupplierEntity } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let mockRepository: any;
  let mockProducer: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      remove: jest.fn(),
    };

    mockProducer = {
      publishSupplierCreated: jest.fn().mockResolvedValue(undefined),
      publishSupplierUpdated: jest.fn().mockResolvedValue(undefined),
      publishSupplierDeleted: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        {
          provide: getRepositoryToken(SupplierEntity),
          useValue: mockRepository,
        },
        {
          provide: 'SuppliersProducerService',
          useValue: mockProducer,
        },
      ],
    })
      .overrideProvider('SuppliersProducerService')
      .useValue(mockProducer)
      .compile();

    service = module.get<SuppliersService>(SuppliersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSupplier', () => {
    it('should create a supplier successfully', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Supplier Inc',
        cnpj: '12345678000190',
        email: 'supplier@example.com',
        phone: '1199999999',
        address: 'Rua Principal, 123',
      };

      const expectedSupplier = {
        id: 'supplier-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedSupplier);
      mockRepository.save.mockResolvedValue(expectedSupplier);

      const result = await service.createSupplier(createDto);

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockProducer.publishSupplierCreated).toHaveBeenCalled();
    });

    it('should throw error when creation fails', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Supplier Inc',
        cnpj: '12345678000190',
        email: 'supplier@example.com',
        phone: '1199999999',
        address: 'Rua Principal, 123',
      };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createSupplier(createDto)).rejects.toThrow(HttpException);
    });
  });

  describe('getSupplierById', () => {
    it('should return a supplier by id', async () => {
      const supplierId = 'supplier-123';
      const expectedSupplier = {
        id: supplierId,
        name: 'Supplier Inc',
        cnpj: '12345678000190',
        email: 'supplier@example.com',
      };

      mockRepository.findOne.mockResolvedValue(expectedSupplier);

      const result = await service.getSupplierById(supplierId);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: supplierId } });
    });

    it('should throw NOT_FOUND when supplier does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getSupplierById('non-existent')).rejects.toThrow(HttpException);
    });
  });

  describe('listSuppliers', () => {
    it('should return list of suppliers', async () => {
      const expectedSuppliers = [
        { id: 'supplier-1', name: 'Supplier 1', cnpj: '12345678000190' },
        { id: 'supplier-2', name: 'Supplier 2', cnpj: '98765432000100' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedSuppliers),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listSuppliers();

      expect(result).toEqual(expectedSuppliers);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('supplier');
    });

    it('should filter by name', async () => {
      const name = 'Supplier';
      const expectedSuppliers = [{ id: 'supplier-1', name: 'Supplier Inc', cnpj: '12345678000190' }];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(expectedSuppliers),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.listSuppliers(name);

      expect(result).toEqual(expectedSuppliers);
      expect(mockQueryBuilder.where).toHaveBeenCalled();
    });
  });

  describe('updateSupplier', () => {
    it('should update a supplier successfully', async () => {
      const supplierId = 'supplier-123';
      const updateDto: UpdateSupplierDto = { email: 'newemail@example.com' };
      const existingSupplier = {
        id: supplierId,
        name: 'Supplier Inc',
        cnpj: '12345678000190',
        email: 'old@example.com',
      };

      mockRepository.findOne.mockResolvedValue(existingSupplier);
      mockRepository.save.mockResolvedValue({ ...existingSupplier, ...updateDto });

      const result = await service.updateSupplier(supplierId, updateDto);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: supplierId } });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockProducer.publishSupplierUpdated).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when supplier does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateSupplier('non-existent', {})).rejects.toThrow(HttpException);
    });
  });

  describe('deleteSupplier', () => {
    it('should delete a supplier successfully', async () => {
      const supplierId = 'supplier-123';
      const existingSupplier = { id: supplierId, name: 'Supplier Inc', cnpj: '12345678000190' };

      mockRepository.findOne.mockResolvedValue(existingSupplier);
      mockRepository.remove.mockResolvedValue(undefined);

      await service.deleteSupplier(supplierId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: supplierId } });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingSupplier);
      expect(mockProducer.publishSupplierDeleted).toHaveBeenCalled();
    });

    it('should throw NOT_FOUND when supplier does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteSupplier('non-existent')).rejects.toThrow(HttpException);
    });
  });
});
