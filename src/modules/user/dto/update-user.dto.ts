import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  username: string;

  @IsOptional()
  email: string;

  @IsOptional()
  role: string;

  @IsOptional()
  password: string;

  @IsOptional()
  account_type: string;

  @IsNotEmpty()
  is_active: boolean;

  @IsOptional()
  code_id: string;

  @IsOptional()
  code_expired: Date;

  @IsOptional()
  phone: string;
}
