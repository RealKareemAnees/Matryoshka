import { Test, TestingModule } from '@nestjs/testing';
import { PullRootFs } from './pull-root-fs.js';

describe('PullRootFs', () => {
  let provider: PullRootFs;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PullRootFs],
    }).compile();

    provider = module.get<PullRootFs>(PullRootFs);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
