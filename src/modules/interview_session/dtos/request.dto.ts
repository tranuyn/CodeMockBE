import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { PaginationQuery } from 'src/common/dtos/request.dto';
import { INTERVIEW_SESSION_STATUS } from 'src/libs/constant/status';
import { Type } from 'class-transformer';
import { ParseOptionalBoolean } from 'src/decorator/customize';

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

export class UpdateInterviewSessionDto extends PartialType(
  CreateInterviewSessionDto,
) {
  @IsOptional()
  @IsDateString()
  endTime?: Date;

  @IsOptional()
  @IsString()
  status?: string;
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
  status?: INTERVIEW_SESSION_STATUS.UPCOMING;

  @IsOptional()
  @IsString()
  levelId?: string;

  @IsOptional()
  @IsString()
  majorIds?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  slotDuration?: number;

  @IsOptional()
  @IsBoolean()
  @ParseOptionalBoolean()
  isFree?: boolean;
}
