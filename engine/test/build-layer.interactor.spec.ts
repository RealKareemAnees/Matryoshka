import { Test, TestingModule } from '@nestjs/testing';
import { BuildLayerInteractor } from '../src/interactors/build-layer.interactor.js';

describe('BuildLayerInteractor', () => {
  let interactor: BuildLayerInteractor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildLayerInteractor],
    }).compile();

    interactor = module.get<BuildLayerInteractor>(BuildLayerInteractor);
  });

  it('should be defined', () => {
    expect(interactor).toBeDefined();
  });
});
