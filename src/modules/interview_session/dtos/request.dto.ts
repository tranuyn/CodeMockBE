import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
// import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQuery } from 'src/common/dtos/request.dto';
import { INTERVIEW_SESSION_STATUS } from 'src/libs/constant/status';

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
  title: string;

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
  title?: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  requirement?: string;
}

export class SearchInterviewSessionRequest extends PaginationQuery {
  // @ApiPropertyOptional({ description: 'Tìm theo tên tiêu đề hoặc mô tả' })
  @IsOptional()
  @IsString()
  search: string;

  // @ApiPropertyOptional({ description: 'Lọc theo userId' })
  @IsOptional()
  @IsString()
  mentorId: string;

  // @ApiPropertyOptional({ description: 'Lọc theo status của session' })
  @IsOptional()
  @IsEnum(INTERVIEW_SESSION_STATUS)
  status?: INTERVIEW_SESSION_STATUS;
}
