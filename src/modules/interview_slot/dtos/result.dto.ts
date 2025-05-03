import { INTERVIEW_SLOT_STATUS } from 'src/libs/constant/status';
import { FeedbackResultDto } from 'src/modules/feedback/dtos/feedback_result.dto';
import { CandidateResultDto } from 'src/modules/user/dto/CandidateResult.dto';

export class InterviewSlotResultDto {
  slotId: string;

  candidate?: CandidateResultDto;

  sessionId: string;

  startTime: Date;
  endTime: Date;

  status: INTERVIEW_SLOT_STATUS;

  isPaid: boolean;

  note?: string;

  feedback?: FeedbackResultDto;
}

// function toSlotDto(slot: InterviewSlot): InterviewSlotResultDto {
//   return {
//     slotId: slot.slotId,
//     candidate: slot.candidate
//       ? {
//           id: slot.candidate.id,
//           username: slot.candidate.username,
//           email: slot.candidate.email,
//         }
//       : undefined,
//     interviewSession: undefined, // bạn có thể gán nếu muốn
//     startTime: slot.startTime,
//     endTime: slot.endTime,
//     status: slot.status,
//     isPaid: slot.isPaid,
//     feedback: slot.feedback ? toFeedbackDto(slot.feedback) : undefined,
//   };
// }
