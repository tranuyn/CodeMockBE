import { Major } from './major.entity';
import { Module } from '@nestjs/common';
import { MajorController } from './major.controller';
import { MajorService } from './major.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Major, User])],
  controllers: [MajorController],
  providers: [MajorService],
  exports: [MajorService],
})
export class MajorModule {}
