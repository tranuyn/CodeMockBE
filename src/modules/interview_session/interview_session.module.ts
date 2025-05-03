import { Module } from '@nestjs/common';
import { InterviewSessionController } from './interview_session.controller';
import { InterviewSessionService } from './interview_session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewSession } from './entities/interview_session.entity';
import { User } from '../user/entities/user.entity';
import { InterviewSlot } from '../interview_slot/entities/interviewSlot.entity';
import { Technology } from '../technology/technology.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InterviewSession,
      InterviewSlot,
      User,
      Technology,
    ]),
  ],
  controllers: [InterviewSessionController],
  providers: [InterviewSessionService],
})
export class InterviewSessionModule {}
