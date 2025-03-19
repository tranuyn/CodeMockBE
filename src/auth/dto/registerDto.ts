import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';

export class RegisterDto {
  @PrimaryGeneratedColumn('uuid') // Hoặc 'increment' nếu bạn muốn ID số tự tăng
  id: string;

  @IsNotEmpty({ message: 'Username không được để trống' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
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

  @IsString()
  phone: string;
}
