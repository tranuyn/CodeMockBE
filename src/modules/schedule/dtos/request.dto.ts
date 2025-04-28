import { IsOptional, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  userId: string;

  @IsString()
  user_role: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  user_role?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
