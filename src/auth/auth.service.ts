import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../modules/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/registerDto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { Repository } from 'typeorm';
import { comparePasswordHelper, hashPasswordHelper } from 'src/helpers/util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    const { password, ...userWithoutPassword } = user;
    return {
      access_token: this.jwtService.sign(userWithoutPassword),
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
      password: hashPassword,
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
