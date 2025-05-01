import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsEnum,
  IsBoolean,
} from 'class-validator';
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
}
export class CancelInterviewSlotDto {
  @IsString()
  candidateId: string;
}
