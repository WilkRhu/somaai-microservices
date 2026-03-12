import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

export async function createTestingModule(
  moduleClass: any,
  overrides?: Record<string, any>,
): Promise<TestingModule> {
  let moduleBuilder = Test.createTestingModule({
    imports: [moduleClass],
  });

  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      moduleBuilder = moduleBuilder.overrideProvider(key).useValue(value);
    }
  }

  return moduleBuilder.compile();
}

export async function createTestApp(
  moduleClass: any,
  overrides?: Record<string, any>,
): Promise<INestApplication> {
  const module = await createTestingModule(moduleClass, overrides);
  const app = module.createNestApplication();
  await app.init();
  return app;
}

export function mockLogger() {
  return {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };
}
