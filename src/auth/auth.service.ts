import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/registerDto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { comparePasswordHelper, hashPasswordHelper } from 'src/helpers/util';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { Response } from 'express';
import { VerifyCodeDto } from './dto/verify-code.dto';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private userService: UserService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async login(param: any, res: Response) {
    const { email, password } = param;
    const user = await this.userService.findByEmail(email);
    if (!user) {
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
      secure: false,
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

  async register(RegisterDto: Partial<User>, res: Response) {
    const isExist = await this.userService.isEmailExist(RegisterDto.email);
    if (isExist)
      throw new BadRequestException(
        `Email ${RegisterDto.email} đã tồn tại. Vui lòng sử dụng email khác`,
      );
    const hashPassword = await hashPasswordHelper(RegisterDto.password);
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const newUser = this.userRepository.create({
      ...RegisterDto,
      is_active: false,
      code_id: uuidv4().replace(/-/g, '').slice(0, 6),
      code_expired: dayjs().utc().add(15, 'minutes').toDate(),
      password: hashPassword,
    });

    // send email
    await this.mailerService.sendMail({
      to: RegisterDto.email,
      subject: 'Activate your account at CodeMock ✔',
      template: 'mail_template_register',
      context: {
        // ✏️ filling curly brackets with content
        name: RegisterDto.username,
        activationCode: newUser.code_id,
      },
    });
    await this.userRepository.save(newUser);

    const {
      password: _password,
      code_id,
      code_expired,
      ...userWithoutSensitiveInfo
    } = newUser;

    return userWithoutSensitiveInfo;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
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

    const user = await this.userService.findByEmail(email);

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

    user.is_active = true;
    await this.userRepository.save(user);

    return {
      message: 'Tài khoản của bạn đã được kích hoạt thành công!',
    };
  }
}
