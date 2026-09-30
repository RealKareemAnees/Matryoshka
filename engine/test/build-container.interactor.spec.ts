import { Test, TestingModule } from '@nestjs/testing';
import { BuildContainerInteractor } from '../src/interactors/build-container.interactor.js';

describe('BuildContainerInteractor', () => {
  let interactor: BuildContainerInteractor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildContainerInteractor],
    }).compile();

    interactor = module.get<BuildContainerInteractor>(BuildContainerInteractor);
  });

  it('should be defined', () => {
    expect(interactor).toBeDefined();
  });
});
