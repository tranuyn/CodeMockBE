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
  majorIds: string[];

  @IsString()
  levelId: string;

  @IsArray()
  @IsString({ each: true })
  requiredTechnologyIds: string[];

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

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredTechnologyIds: string[];
}
