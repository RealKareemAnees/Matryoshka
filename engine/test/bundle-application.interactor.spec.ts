import { Test, TestingModule } from '@nestjs/testing';
import { BundleApplicationInteractor } from '../src/interactors/bundle-application.interactor.js';

describe('BundleApplicationInteractor', () => {
  let interactor: BundleApplicationInteractor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BundleApplicationInteractor],
    }).compile();

    interactor = module.get<BundleApplicationInteractor>(BundleApplicationInteractor);
  });

  it('should be defined', () => {
    expect(interactor).toBeDefined();
  });
});
