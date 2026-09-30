import { Test, TestingModule } from '@nestjs/testing';
import { ProcessConstructionFileToAppBundleService } from './process-construction-file-to-app-bundle.service.js';

describe('ProcessConstructionFileToAppBundleService', () => {
  let service: ProcessConstructionFileToAppBundleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcessConstructionFileToAppBundleService],
    }).compile();

    service = module.get<ProcessConstructionFileToAppBundleService>(ProcessConstructionFileToAppBundleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
