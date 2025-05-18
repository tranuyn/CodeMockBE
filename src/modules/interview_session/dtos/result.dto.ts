import { INTERVIEW_SESSION_STATUS } from 'src/libs/constant/status';
import { InterviewSlotResultDto } from 'src/modules/interview_slot/dtos/result.dto';
import { TechnologyResultDto } from 'src/modules/technology/dtos/result.dto';

export class InterviewSessionResultDto {
  sessionId: string;
  mentorId: string;
  startTime: Date;
  endTime: Date;
  totalSlots: number;
  slotDuration: number;
  status: INTERVIEW_SESSION_STATUS;
  majors: string[];
  level: string;
  requiredTechnology: TechnologyResultDto[];
  sessionPrice: number;
  meetingLink?: string;
  recordingURL?: string;
  createdAt: Date;
  updatedAt: Date;
  interviewSlots: InterviewSlotResultDto[];
  description: string;
  requirement?: string;
}
