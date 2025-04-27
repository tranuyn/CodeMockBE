import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsNumber()
  userId: number;

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
