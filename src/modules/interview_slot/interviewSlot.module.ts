import { Module } from '@nestjs/common';
import { InterviewSlotService } from './interviewSlot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewSlot } from './entities/interviewSlot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InterviewSlot])],
  controllers: [InterviewSlot],
  providers: [InterviewSlotService],
  exports: [InterviewSlot],
})
export class ScheduleModule {}
