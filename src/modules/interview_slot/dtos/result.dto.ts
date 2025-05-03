import { INTERVIEW_SLOT_STATUS } from 'src/libs/constant/status';
import { FeedbackResultDto } from 'src/modules/feedback/dtos/feedback_result.dto';

export class InterviewSlotResultDto {
  slotId: string;

  candidateId?: string;

  sessionId: string;

  startTime: Date;
  endTime: Date;

  status: INTERVIEW_SLOT_STATUS;

  isPaid: boolean;

  note?: string;

  feedback?: FeedbackResultDto;
}
