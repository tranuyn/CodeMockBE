import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ROLE } from 'src/common/enums/role.enum';
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
  @IsEnum(ROLE)
  role: ROLE;

  @IsOptional()
  password: string;

  @IsOptional()
  account_type: string;

  @IsOptional()
  educationLevel: string;

  @IsOptional()
  technologies: string[];

  @IsOptional()
  majors: string[];

  @IsOptional()
  @IsString()
  levelId: string;

  @IsOptional()
  phone: string;

  @IsOptional()
  is_active: boolean;

  @IsOptional()
  code_id: string;

  @IsOptional()
  code_expired: Date;
}
