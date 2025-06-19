import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewSlot } from './entities/interviewSlot.entity';
import { InterviewSlotService } from './interviewSlot.service';
import { InterviewSlotController } from './interviewSlot.controller';
import { UserModule } from '../user/user.module';
import { Candidate } from '../user/entities/candidate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InterviewSlot, Candidate]), UserModule],
  controllers: [InterviewSlotController],
  providers: [InterviewSlotService],
  exports: [InterviewSlotService, TypeOrmModule],
})
export class InterviewSlotModule {}
