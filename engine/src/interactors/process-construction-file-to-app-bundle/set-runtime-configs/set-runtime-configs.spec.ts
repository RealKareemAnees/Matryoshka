import { Test, TestingModule } from '@nestjs/testing';
import { SetRuntimeConfigs } from './set-runtime-configs.js';

describe('SetRuntimeConfigs', () => {
  let provider: SetRuntimeConfigs;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SetRuntimeConfigs],
    }).compile();

    provider = module.get<SetRuntimeConfigs>(SetRuntimeConfigs);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
