import { Test, TestingModule } from '@nestjs/testing';
import { ProcessConstructioFileInteractor } from '../src/interactors/process-constructio-file.interactor.js';

describe('ProcessConstructioFileInteractor', () => {
  let interactor: ProcessConstructioFileInteractor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcessConstructioFileInteractor],
    }).compile();

    interactor = module.get<ProcessConstructioFileInteractor>(ProcessConstructioFileInteractor);
  });

  it('should be defined', () => {
    expect(interactor).toBeDefined();
  });
});
