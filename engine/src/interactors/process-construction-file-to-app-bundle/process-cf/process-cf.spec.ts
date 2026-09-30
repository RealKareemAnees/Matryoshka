import { Test, TestingModule } from '@nestjs/testing';
import { ProcessCf } from './process-cf.js';

describe('ProcessCf', () => {
  let provider: ProcessCf;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcessCf],
    }).compile();

    provider = module.get<ProcessCf>(ProcessCf);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
