import { InterviewSlotResultDto } from 'src/modules/interview_slot/dtos/result.dto';

export class InterviewSessionResultDto {
  sessionId: string;
  mentorId: string;
  scheduleDateTime: Date;
  duration: number;
  slotDuration: number;
  status: string;
  major_id: string[];
  level_id: string;
  requiredTechnology: string[];
  sessionPrice: number;
  meetingLink?: string;
  recordingURL?: string;
  createdAt: Date;
  updatedAt: Date;
  interviewSlots: InterviewSlotResultDto[];
}
