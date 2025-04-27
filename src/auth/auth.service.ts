import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/registerDto';
import { User } from 'src/modules/user/entity/user.entity';
import { comparePasswordHelper, hashPasswordHelper } from 'src/helpers/util';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { Response } from 'express';
import { VerifyCodeDto } from './dto/verify-code.dto';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async login(param: any, res: Response) {
    const { email, password } = param;

    // Find user by email
    const { data: user, error: findError } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !user) {
      throw new NotFoundException(
        `Email ${email} không tồn tại trong hệ thống.`,
      );
    }

    const isPasswordValid = await comparePasswordHelper(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không chính xác.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const access_token = this.jwtService.sign(payload);

    res.cookie('Token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ngày
    });

    const {
      password: _password,
      code_id,
      code_expired,
      ...userWithoutSensitiveInfo
    } = user;

    return {
      access_token,
      user: userWithoutSensitiveInfo,
    };
  }

  async register(registerDto: Partial<User>, res: Response) {
    // Check if email exists
    const { data: existingUser } = await this.supabase
      .from('users')
      .select('id')
      .eq('email', registerDto.email)
      .single();

    if (existingUser) {
      throw new BadRequestException(
        `Email ${registerDto.email} đã tồn tại. Vui lòng sử dụng email khác`,
      );
    }

    const hashPassword = await hashPasswordHelper(registerDto.password);

    dayjs.extend(utc);
    dayjs.extend(timezone);

    const codeId = uuidv4().replace(/-/g, '').slice(0, 6);
    const codeExpired = dayjs().utc().add(15, 'minutes').toDate();

    // Create new user
    const { data: newUser, error: insertError } = await this.supabase
      .from('users')
      .insert({
        ...registerDto,
        is_active: false,
        code_id: codeId,
        code_expired: codeExpired,
        password: hashPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new BadRequestException(
        `Không thể tạo tài khoản: ${insertError.message}`,
      );
    }

    // Send email
    await this.mailerService.sendMail({
      to: registerDto.email,
      subject: 'Activate your account at CodeMock ✔',
      template: 'mail_template_register',
      context: {
        name: registerDto.username,
        activationCode: codeId,
      },
    });

    const {
      password: _password,
      code_id,
      code_expired,
      ...userWithoutSensitiveInfo
    } = newUser;

    return userWithoutSensitiveInfo;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Tài khoản email không tồn tại');
    }

    if (!(await comparePasswordHelper(pass, user.password))) {
      throw new UnauthorizedException('Mật khẩu không hợp lệ');
    } else {
      const { password, ...result } = user;
      return result;
    }
  }

  async verifyCode(verifyDto: VerifyCodeDto) {
    const { code_id, email } = verifyDto;

    // Find user by email
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new NotFoundException(
        `Không tìm thấy tài khoản với email ${email}`,
      );
    }

    if (code_id !== user.code_id) {
      throw new BadRequestException('Mã xác minh không chính xác.');
    }

    if (user.is_active) {
      throw new BadRequestException('Tài khoản đã được kích hoạt.');
    }

    const now = dayjs();

    if (now.isAfter(user.code_expired)) {
      throw new BadRequestException('Mã xác minh đã hết hạn.');
    }

    // Update user to active
    const { error: updateError } = await this.supabase
      .from('users')
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw new BadRequestException(
        `Không thể kích hoạt tài khoản: ${updateError.message}`,
      );
    }

    return {
      message: 'Tài khoản của bạn đã được kích hoạt thành công!',
    };
  }

  // You can also add Supabase-specific auth methods
  async signInWithSupabase(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return data;
  }

  async resetPasswordRequest(email: string) {
    // Check if user exists
    const { data: user, error: findError } = await this.supabase
      .from('users')
      .select('id, username')
      .eq('email', email)
      .single();

    if (findError || !user) {
      throw new NotFoundException(
        `Email ${email} không tồn tại trong hệ thống.`,
      );
    }

    const codeId = uuidv4().replace(/-/g, '').slice(0, 6);
    const codeExpired = dayjs().utc().add(15, 'minutes').toDate();

    // Update user with new code
    const { error: updateError } = await this.supabase
      .from('users')
      .update({
        code_id: codeId,
        code_expired: codeExpired,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw new BadRequestException(
        `Không thể tạo mã reset password: ${updateError.message}`,
      );
    }

    // Send email
    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password at CodeMock',
      template: 'mail_template_reset_password',
      context: {
        name: user.username,
        resetCode: codeId,
      },
    });

    return {
      message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.',
    };
  }
}
