import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { PrimaryGeneratedColumn } from 'typeorm';

export class CreateUserDto {
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

  password: string;

  account_type: string;

  @IsNotEmpty()
  is_active: boolean;

  code_id: string;

  code_expired: Date;

  phone: string;
}
