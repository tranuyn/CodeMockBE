import { Feedback } from 'src/modules/feedback/entities/feedback.entity';

export class InterviewSlotResultDto {
  interviewSlotId: string;
  candidateId: string;
  startTime: Date;
  endTime: Date;
  feedback: Feedback;
  note?: string;
}
