import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnamneseModule } from './anamnese/anamnese.module';

@Module({
  imports: [AnamneseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
