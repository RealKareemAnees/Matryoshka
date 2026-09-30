import { Test, TestingModule } from '@nestjs/testing';
import { BuildApplicationBundle } from './build-application-bundle.js';

describe('BuildApplicationBundle', () => {
  let provider: BuildApplicationBundle;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildApplicationBundle],
    }).compile();

    provider = module.get<BuildApplicationBundle>(BuildApplicationBundle);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
