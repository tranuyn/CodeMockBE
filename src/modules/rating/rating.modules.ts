import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from './rating.entity';
import { Candidate } from '../user/entities/candidate.entity';
import { Mentor } from '../user/entities/mentor.entity';
import { InterviewSession } from '../interview_session/entities/interview_session.entity';
import { InterviewSlot } from '../interview_slot/entities/interviewSlot.entity';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Rating,
      Candidate,
      Mentor,
      InterviewSession,
      InterviewSlot,
      User,
    ]),
  ],
  controllers: [RatingController],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}
