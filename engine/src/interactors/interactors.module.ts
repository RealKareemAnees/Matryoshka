import { Module } from '@nestjs/common';
import { BuildContainerInteractor } from './build-container.interactor.js';
import { BuildLayerInteractor } from './build-layer.interactor.js';
import { BundleApplicationInteractor } from './bundle-application.interactor.js';
import { ProcessConstructionFileInteractor } from './process-construction-file.interactor.js';
import { SetRuntimeConfigurationsInteractor } from './set-runtime-configurations.interactor.js';

const interactors = [
  BuildContainerInteractor,
  BuildLayerInteractor,
  BundleApplicationInteractor,
  ProcessConstructionFileInteractor,
  SetRuntimeConfigurationsInteractor,
];

@Module({
  providers: [...interactors],
  exports: [...interactors],
})
export class InteractorsModule { }
