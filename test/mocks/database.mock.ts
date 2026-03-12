export const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn(),
};

export const mockDataSource = {
  getRepository: jest.fn().mockReturnValue(mockRepository),
  createQueryBuilder: jest.fn(),
  transaction: jest.fn(),
};

export const mockConnection = {
  getRepository: jest.fn().mockReturnValue(mockRepository),
  query: jest.fn(),
};
