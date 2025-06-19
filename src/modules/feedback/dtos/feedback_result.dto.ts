import { Expose } from 'class-transformer';

export class FeedbackResultDto {
  @Expose() feedbackId: number;
  @Expose() strengths: string;
  @Expose() improvementAreas: string;
  @Expose() overallPerformance: string;
  @Expose() technicalScore: number;
  @Expose() communicationScore: number;
  @Expose() problemSolvingScore: number;
  @Expose() createAt: Date;
}
