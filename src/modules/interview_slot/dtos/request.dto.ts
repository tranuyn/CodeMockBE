import { IsOptional, IsString } from 'class-validator';

export class CreateInterviewSlotDto {
  @IsString()
  userId: string;

  @IsString()
  user_role: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateInterviewSlotDto {
  @IsOptional()
  @IsString()
  user_role?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
