import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateInterviewSessionDto {
  @IsArray()
  @IsString({ each: true })
  candidate_id: string[];

  @IsNumber()
  mentorId: number;

  @IsDateString()
  scheduleDateTime: Date;

  @IsNumber()
  duration: number;

  @IsString()
  status: string;

  @IsString()
  major_id: string;

  @IsString()
  level_id: string;

  @IsArray()
  @IsString({ each: true })
  requiredTechnology: string[];

  @IsNumber()
  sessionPrice: number;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsString()
  recordingURL?: string;
}

export class UpdateInterviewSessionDto {
  @IsOptional()
  @IsDateString()
  scheduleDateTime?: Date;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsString()
  recordingURL?: string;
}
