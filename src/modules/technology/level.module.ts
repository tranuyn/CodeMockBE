import { Technology } from './technology.entity';
import { Module } from '@nestjs/common';
import { TechnologyController } from './technology.controller';
import { TechnologyService } from './technology.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Technology, User])],
  controllers: [TechnologyController],
  providers: [TechnologyService],
  exports: [TechnologyService],
})
export class TechnologyModule {}
