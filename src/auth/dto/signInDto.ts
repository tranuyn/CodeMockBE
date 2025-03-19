import { IsEmail, IsOptional } from 'class-validator';

export class SignInDto {
  @IsEmail()
  email: string;

  @IsOptional()
  password: string;
}
