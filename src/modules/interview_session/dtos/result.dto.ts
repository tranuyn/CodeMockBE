import { ScheduleResultDto } from 'src/modules/schedule/dtos/result.dto';

export class InterviewSessionResultDto {
  sessionId: number;
  candidate_id: string[];
  mentorId: string;
  scheduleDateTime: Date;
  duration: number;
  status: string;
  major_id: string;
  level_id: string;
  requiredTechnology: string[];
  sessionPrice: number;
  meetingLink?: string;
  recordingURL?: string;
  createAt: Date;
  schedule: ScheduleResultDto;
}
