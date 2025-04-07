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
import { User } from 'src/modules/user/entity/user.entity';
import { Repository } from 'typeorm';
import { comparePasswordHelper, hashPasswordHelper } from 'src/helpers/util';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { Response } from 'express';

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

    res.cookie('token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ngày
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async register(RegisterDto: RegisterDto): Promise<User> {
    const isExist = await this.userService.isEmailExist(RegisterDto.email);
    if (isExist)
      throw new BadRequestException(
        `Email ${RegisterDto.email} đã tồn tại. Vui lòng sử dụng email khác`,
      );
    const hashPassword = await hashPasswordHelper(RegisterDto.password);
    const newUser = this.userRepository.create({
      ...RegisterDto,
      is_active: false,
      code_id: uuidv4().slice(6),
      code_expired: dayjs().add(15, 'minutes'),
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
    return await this.userRepository.save(newUser);
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
}
