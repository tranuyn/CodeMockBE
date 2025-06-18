import { Expose, Type } from 'class-transformer';
import { INTERVIEW_SLOT_STATUS } from 'src/libs/constant/status';
import { FeedbackResultDto } from 'src/modules/feedback/dtos/feedback_result.dto';
import { InterviewSessionResultDto } from 'src/modules/interview_session/dtos/result.dto';
import { UserResultDto } from 'src/modules/user/dto/CandidateResult.dto';

export class InterviewSlotResultDto {
  @Expose() slotId: string;

  @Expose()
  @Type(() => UserResultDto)
  candidate?: UserResultDto;

  @Expose() sessionId: string;

  @Expose() startTime: Date;
  @Expose() endTime: Date;

  @Expose() status: INTERVIEW_SLOT_STATUS;

  @Expose() isPaid: boolean;

  @Expose() note?: string;

  @Expose()
  @Type(() => FeedbackResultDto)
  feedback?: FeedbackResultDto;

  @Expose() rating?: number;
  @Expose()
  @Type(() => InterviewSessionResultDto)
  interviewSession: InterviewSessionResultDto;
}
