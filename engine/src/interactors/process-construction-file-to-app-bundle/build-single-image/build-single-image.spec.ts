import { Test, TestingModule } from '@nestjs/testing';
import { BuildSingleImage } from './build-single-image.js';

describe('BuildSingleImage', () => {
  let provider: BuildSingleImage;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuildSingleImage],
    }).compile();

    provider = module.get<BuildSingleImage>(BuildSingleImage);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
