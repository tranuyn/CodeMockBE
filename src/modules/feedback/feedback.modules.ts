import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from '../user/entities/candidate.entity';
import { Mentor } from '../user/entities/mentor.entity';
import { InterviewSession } from '../interview_session/entities/interview_session.entity';
import { InterviewSlot } from '../interview_slot/entities/interviewSlot.entity';
import { User } from '../user/entities/user.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { Feedback } from './entities/feedback.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Feedback,
      Candidate,
      Mentor,
      InterviewSession,
      InterviewSlot,
      User,
    ]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
