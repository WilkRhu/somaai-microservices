import { Test, TestingModule } from '@nestjs/testing';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let service: SuppliersService;

  beforeEach(async () => {
    const mockService = {
      createSupplier: jest.fn(),
      getSupplierById: jest.fn(),
      listSuppliers: jest.fn(),
      updateSupplier: jest.fn(),
      deleteSupplier: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        {
          provide: SuppliersService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
    service = module.get<SuppliersService>(SuppliersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a supplier', async () => {
      const createDto: CreateSupplierDto = {
        name: 'Supplier Inc',
        cnpj: '12345678000190',
        email: 'supplier@example.com',
        phone: '1199999999',
        address: 'Rua Principal, 123',
      };

      const expectedResult = {
        id: 'supplier-123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'createSupplier').mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.createSupplier).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return list of suppliers', async () => {
      const expectedResult = [
        { id: 'supplier-1', name: 'Supplier 1', cnpj: '12345678000190' },
        { id: 'supplier-2', name: 'Supplier 2', cnpj: '98765432000100' },
      ];

      jest.spyOn(service, 'listSuppliers').mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(service.listSuppliers).toHaveBeenCalled();
    });

    it('should filter by name', async () => {
      const name = 'Supplier';
      const expectedResult = [{ id: 'supplier-1', name: 'Supplier Inc', cnpj: '12345678000190' }];

      jest.spyOn(service, 'listSuppliers').mockResolvedValue(expectedResult);

      const result = await controller.findAll(name);

      expect(result).toEqual(expectedResult);
      expect(service.listSuppliers).toHaveBeenCalledWith(name);
    });
  });

  describe('findOne', () => {
    it('should return a supplier by id', async () => {
      const supplierId = 'supplier-123';
      const expectedResult = {
        id: supplierId,
        name: 'Supplier Inc',
        cnpj: '12345678000190',
        email: 'supplier@example.com',
      };

      jest.spyOn(service, 'getSupplierById').mockResolvedValue(expectedResult);

      const result = await controller.findOne(supplierId);

      expect(result).toEqual(expectedResult);
      expect(service.getSupplierById).toHaveBeenCalledWith(supplierId);
    });
  });

  describe('update', () => {
    it('should update a supplier', async () => {
      const supplierId = 'supplier-123';
      const updateDto: UpdateSupplierDto = { email: 'newemail@example.com' };
      const expectedResult = {
        id: supplierId,
        name: 'Supplier Inc',
        cnpj: '12345678000190',
        email: 'newemail@example.com',
      };

      jest.spyOn(service, 'updateSupplier').mockResolvedValue(expectedResult);

      const result = await controller.update(supplierId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.updateSupplier).toHaveBeenCalledWith(supplierId, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a supplier', async () => {
      const supplierId = 'supplier-123';

      jest.spyOn(service, 'deleteSupplier').mockResolvedValue(undefined);

      await controller.remove(supplierId);

      expect(service.deleteSupplier).toHaveBeenCalledWith(supplierId);
    });
  });
});
