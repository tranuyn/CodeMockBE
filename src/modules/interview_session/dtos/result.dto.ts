import { Expose, Type } from 'class-transformer';
import { INTERVIEW_SESSION_STATUS } from 'src/libs/constant/status';
import { InterviewSlotResultDto } from 'src/modules/interview_slot/dtos/result.dto';
import { LevelResultDto } from 'src/modules/level/dtos/result.dto';
import { MajorResultDto } from 'src/modules/major/dtos/result.dto';
import { TechnologyResultDto } from 'src/modules/technology/dtos/result.dto';
import { UserResultDto } from 'src/modules/user/dto/CandidateResult.dto';

export class InterviewSessionResultDto {
  @Expose() sessionId: string;
  @Expose() @Type(() => UserResultDto) mentor: UserResultDto;

  @Expose() title: string;

  @Expose() startTime: Date;
  @Expose() endTime: Date;
  @Expose() totalSlots: number;
  @Expose() slotDuration: number;
  @Expose() status: INTERVIEW_SESSION_STATUS;
  @Expose()
  @Type(() => MajorResultDto)
  majors: MajorResultDto[];

  @Expose()
  @Type(() => LevelResultDto)
  level: LevelResultDto;

  @Expose()
  @Type(() => TechnologyResultDto)
  requiredTechnologies: TechnologyResultDto[];

  @Expose() sessionPrice: number;
  @Expose() meetingLink?: string;
  @Expose() recordingURL?: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
  @Expose()
  @Type(() => InterviewSlotResultDto)
  interviewSlots: InterviewSlotResultDto[];

  @Expose() description: string;
  @Expose() requirement?: string;
  @Expose() roomId: string;
}
