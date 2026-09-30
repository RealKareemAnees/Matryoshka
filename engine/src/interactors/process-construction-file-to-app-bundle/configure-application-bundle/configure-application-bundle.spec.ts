import { Test, TestingModule } from '@nestjs/testing';
import { ConfigureApplicationBundle } from './configure-application-bundle.js';

describe('ConfigureApplicationBundle', () => {
  let provider: ConfigureApplicationBundle;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigureApplicationBundle],
    }).compile();

    provider = module.get<ConfigureApplicationBundle>(ConfigureApplicationBundle);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
