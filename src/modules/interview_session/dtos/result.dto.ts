import { InterviewSlotResultDto } from 'src/modules/interview_slot/dtos/result.dto';
import { TechnologyResultDto } from 'src/modules/technology/dtos/result.dto';

export class InterviewSessionResultDto {
  sessionId: string;
  mentorId: string;
  scheduleDateTime: Date;
  duration: number;
  slotDuration: number;
  status: string;
  majors: string[];
  level: string;
  requiredTechnology: TechnologyResultDto[];
  sessionPrice: number;
  meetingLink?: string;
  recordingURL?: string;
  createdAt: Date;
  updatedAt: Date;
  interviewSlots: InterviewSlotResultDto[];
}
