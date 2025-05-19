import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  Res,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { RegisterDto } from './dto/registerDto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SignInDto } from './dto/signInDto';
import { Response } from 'express';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { User } from 'src/modules/user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('login')
  @Public() // Not check logic related to JWT
  @UseGuards(LocalAuthGuard)
  async login(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(signInDto, res);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(registerDto, res);
  }

  @Public() // Not check JWT
  @Post('logout')
  async logout(@Request() req) {
    return req.logout();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public() // Not check JWT
  @Post('sendmail')
  async sendMail(
    @Body() body: { email: string; username: string; activationCode: string },
  ) {
    try {
      await this.mailerService.sendMail({
        to: body.email,
        subject: 'Activate your account at CodeMock ✔',
        template: 'mail_template_register',
        context: {
          // ✏️ filling curly brackets with content
          name: body.username,
          activationCode: body.activationCode,
        },
      });
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(error);
    }
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('verify-code')
  async verifyCode(@Body() verifyDto: VerifyCodeDto) {
    return this.authService.verifyCode(verifyDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Patch('refresh-token')
  async refreshToken(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(req, res);
  }
}
