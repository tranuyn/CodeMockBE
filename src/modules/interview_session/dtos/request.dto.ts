import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateInterviewSessionDto {
  @IsString()
  mentorId: string;

  @IsDateString()
  scheduleDateTime: Date;

  @IsNumber()
  duration: number;

  @IsNumber()
  slotDuration: number;

  @IsString()
  status: string;

  @IsArray()
  @IsString({ each: true })
  major_id: string[];

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
  @IsNumber()
  slotDuration?: number;

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
