import { Module } from '@nestjs/common';
import { InterviewSessionController } from './interview_session.controller';
import { InterviewSessionService } from './interview_session.service';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [ScheduleModule],
  controllers: [InterviewSessionController],
  providers: [InterviewSessionService],
})
export class InterviewSessionModule {}
