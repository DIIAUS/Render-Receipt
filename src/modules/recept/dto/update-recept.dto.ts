import { PartialType } from '@nestjs/swagger';
import { CreateReceptDto } from './create-recept.dto';

export class UpdateReceptDto extends PartialType(CreateReceptDto) {}
