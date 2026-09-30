import { Module } from '@nestjs/common';
import { ProcessCf } from './process-cf/process-cf.js';
import { BuildSingleImage } from './build-single-image/build-single-image.js';
import { ConfigureApplicationBundle } from './configure-application-bundle/configure-application-bundle.js';
import { BuildApplicationBundle } from './build-application-bundle/build-application-bundle.js';
import { SetRuntimeConfigs } from './set-runtime-configs/set-runtime-configs.js';
import { PullRootFs } from './pull-root-fs/pull-root-fs.js';

@Module({
  providers: [ProcessCf, BuildSingleImage, ConfigureApplicationBundle, BuildApplicationBundle, SetRuntimeConfigs, PullRootFs]
})
export class ProcessConstructionFileToAppBundleModule {}
