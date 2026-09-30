import { Module } from '@nestjs/common';
import { ProcessConstructionFileToAppBundleModule } from './process-construction-file-to-app-bundle/process-construction-file-to-app-bundle.module.js';

@Module({
  imports: [ProcessConstructionFileToAppBundleModule]
})
export class InteractorsModule {}
