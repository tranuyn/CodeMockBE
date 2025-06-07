import { updateUserCount } from './../helpers/update_user_mlv';
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
import { Major } from 'src/modules/major/major.entity';
import { Level } from 'src/modules/level/level.entity';
import { Technology } from 'src/modules/technology/technology.entity';
import { ROLE } from 'src/common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private userService: UserService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    @InjectRepository(Major) private majorRepo: Repository<Major>,
    @InjectRepository(Level) private levelRepo: Repository<Level>,
    @InjectRepository(Technology) private techRepo: Repository<Technology>,
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
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    res.cookie('Token', access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 30,
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
  async register(registerDto: RegisterDto, res: Response) {
    // 1. Kiểm tra email đã tồn tại
    const exists = await this.userService.isEmailExist(registerDto.email);
    if (exists) {
      throw new BadRequestException(
        `Email ${registerDto.email} đã tồn tại. Vui lòng sử dụng email khác.`,
      );
    }

    // 2. Hash mật khẩu
    const hashedPassword = await hashPasswordHelper(registerDto.password);

    // 3. Chuẩn bị code kích hoạt
    const activationCode = uuidv4().replace(/-/g, '').slice(0, 6);
    //const activationExpires = dayjs().utc().add(15, 'minutes').toDate();

    // 4. Tách các trường relation ra ngoài
    const { majors, levelId, technologies, ...rest } = registerDto;

    dayjs.extend(utc);
    dayjs.extend(timezone);
    // 5. Tạo entity User mới (chưa lưu)
    const newUser = this.userRepository.create({
      ...rest,
      password: hashedPassword,
      is_active: false,
      code_id: activationCode,
      code_expired: dayjs().utc().add(15, 'minutes').toDate(),
      role: ROLE.CANDIDATE,
      // gán các relation nếu có
      majors: majors?.map((id) => ({ id })) ?? [],
      level: levelId ? ({ id: levelId } as Level) : null,
      technologies: technologies?.map((id) => ({ id })) ?? [],
    });

    // 6. Lưu user vào database
    await this.userRepository.save(newUser);

    // 7. Cập nhật lại số lượng user trên từng major/level/technology
    await updateUserCount(this.majorRepo, this.levelRepo, this.techRepo);

    // 8. Gửi email kích hoạt
    await this.mailerService.sendMail({
      to: registerDto.email,
      subject: 'Activate your account at CodeMock ✔',
      template: 'mail_template_register',
      context: {
        name: registerDto.username,
        activationCode,
      },
    });

    // 9. Trả về dữ liệu không chứa thông tin nhạy cảm
    const { password: _pw, code_id, code_expired, ...safeUser } = newUser;
    return safeUser;
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

    // if (user.is_active) {
    //   throw new BadRequestException('Tài khoản đã được kích hoạt.');
    // }

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

  async refreshToken(req: Request, res: Response) {
    try {
      // Lấy token từ Authorization header
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        throw new UnauthorizedException(
          'Không tìm thấy token trong authorization header',
        );
      }

      // Kiểm tra định dạng "Bearer <token>"
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        throw new UnauthorizedException(
          'Định dạng Authorization header không hợp lệ',
        );
      }

      const token = parts[1];

      // Verify token
      const decoded = this.jwtService.verify(token, { ignoreExpiration: true });

      // Kiểm tra thông tin người dùng trong token
      if (!decoded || !decoded.id) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const payload = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role,
      };

      const new_access_token = this.jwtService.sign(payload, {
        expiresIn: '3d',
      });

      res.cookie('Token', new_access_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 ngày
      });

      return {
        access_token: new_access_token,
      };
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ: ' + error.message);
    }
  }
}
