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
  startTime: Date;

  @IsNumber()
  totalSlots: number;

  @IsNumber()
  slotDuration: number;

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

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  requirement?: string;
}

export class UpdateInterviewSessionDto {
  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @IsOptional()
  @IsDateString()
  endTime?: Date;

  @IsOptional()
  @IsNumber()
  totalSlots?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  majorIds?: string[];

  @IsOptional()
  @IsString()
  levelId?: string;

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

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  requirement?: string;
}
