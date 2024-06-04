import { Module } from '@nestjs/common';
import { ReceptService } from './recept.service';
import { ReceptController } from './recept.controller';
import { FileService } from 'src/utlility/file.service';

@Module({
  controllers: [ReceptController],
  providers: [ReceptService, FileService],
})
export class ReceptModule {}
