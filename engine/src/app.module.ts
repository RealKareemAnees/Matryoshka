import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { InteractorsModule } from './interactors/interactors.module.js';

@Module({
  imports: [InteractorsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
