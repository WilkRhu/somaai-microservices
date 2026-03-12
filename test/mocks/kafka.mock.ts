export const mockKafkaProducer = {
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  send: jest.fn().mockResolvedValue([{ topicName: 'test', partition: 0, errorCode: 0 }]),
};

export const mockKafkaConsumer = {
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn().mockResolvedValue(undefined),
  run: jest.fn().mockResolvedValue(undefined),
};

export const mockKafka = {
  producer: jest.fn().mockReturnValue(mockKafkaProducer),
  consumer: jest.fn().mockReturnValue(mockKafkaConsumer),
};
