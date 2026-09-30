import { Test, TestingModule } from '@nestjs/testing';
import { SetRuntimeConfigurationsInteractor } from '../src/interactors/set-runtime-configurations.interactor.js';

describe('SetRuntimeConfigurationsInteractor', () => {
  let interactor: SetRuntimeConfigurationsInteractor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SetRuntimeConfigurationsInteractor],
    }).compile();

    interactor = module.get<SetRuntimeConfigurationsInteractor>(
      SetRuntimeConfigurationsInteractor,
    );
  });

  it('should be defined', () => {
    expect(interactor).toBeDefined();
  });
});
