import { Expose, Type } from 'class-transformer';
import { UserResultDto } from 'src/modules/user/dto/CandidateResult.dto';
import { InterviewSlotResultDto } from 'src/modules/interview_slot/dtos/result.dto';
import { InterviewSessionResultDto } from 'src/modules/interview_session/dtos/result.dto';

export class RatingResultDto {
  @Expose() ratingId: string;

  @Expose()
  @Type(() => UserResultDto)
  candidate: UserResultDto;

  @Expose()
  @Type(() => InterviewSlotResultDto)
  slot: InterviewSlotResultDto;

  @Expose()
  @Type(() => UserResultDto)
  mentor: UserResultDto;

  @Expose()
  @Type(() => InterviewSessionResultDto)
  interviewSession: InterviewSessionResultDto;

  @Expose() ratingStar: number;
  @Expose() comment: string;
}
