import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyCodeDto {
  @IsNotEmpty({ message: 'Mã xác minh không được để trống' })
  @IsString()
  code_id: string;

  @IsEmail()
  email: string;
}
