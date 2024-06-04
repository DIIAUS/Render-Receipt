import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReceptModule } from './modules/recept/recept.module';

@Module({
  imports: [ReceptModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
