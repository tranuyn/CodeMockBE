import { IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateInterviewSlotDto {
  @IsString()
  candidateId: string;

  @IsUUID()
  sessionId: string;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateInterviewSlotDto {
  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @IsOptional()
  @IsDateString()
  endTime?: Date;
}
