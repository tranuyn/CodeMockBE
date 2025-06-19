import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { PaginationQuery } from 'src/common/dtos/request.dto';
import { ParseOptionalBoolean } from 'src/decorator/customize';
import { INTERVIEW_SLOT_STATUS } from 'src/libs/constant/status';

export class CreateInterviewSlotDto {
  @IsUUID()
  sessionId: string;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;

  @IsOptional()
  @IsString()
  candidateId?: string;

  @IsOptional()
  @IsEnum(INTERVIEW_SLOT_STATUS)
  status?: INTERVIEW_SLOT_STATUS;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}

export class UpdateInterviewSlotDto {
  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @IsOptional()
  @IsDateString()
  endTime?: Date;

  @IsOptional()
  @IsEnum(INTERVIEW_SLOT_STATUS)
  status?: INTERVIEW_SLOT_STATUS;

  @IsOptional()
  @IsString()
  candidateId?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;
}

export class RegisterInterviewSlotDto {
  @IsString()
  candidateId: string;

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  payByCodemockCoin?: boolean;
}
export class CancelInterviewSlotDto {
  @IsString()
  candidateId: string;
}

export class SearchInterviewSlotRequest extends PaginationQuery {
  // @ApiPropertyOptional({ description: 'Tìm theo tên tiêu đề hoặc mô tả' })
  @IsOptional()
  @IsString()
  search?: string;

  // @ApiPropertyOptional({ description: 'Lọc theo userId' })
  @IsOptional()
  @IsString()
  candidateId: string;

  // @ApiPropertyOptional({ description: 'Lọc theo status của session' })
  @IsOptional()
  @IsEnum(INTERVIEW_SLOT_STATUS)
  status?: INTERVIEW_SLOT_STATUS.DONE;

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
