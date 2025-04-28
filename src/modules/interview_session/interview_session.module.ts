import { Module } from '@nestjs/common';
import { InterviewSessionController } from './interview_session.controller';
import { InterviewSessionService } from './interview_session.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewSession } from './entities/interview_session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InterviewSession])],
  controllers: [InterviewSessionController],
  providers: [InterviewSessionService],
})
export class InterviewSessionModule {}
