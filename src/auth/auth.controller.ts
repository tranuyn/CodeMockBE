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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { RegisterDto } from './dto/registerDto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SignInDto } from './dto/signInDto';
import { Response } from 'express';

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

  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
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
}
