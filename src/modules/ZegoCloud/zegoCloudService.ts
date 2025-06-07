import { ConfigService } from '@nestjs/config';
import { Injectable, BadRequestException } from '@nestjs/common';
import { generateToken04 } from './zegocloudAssistant';

@Injectable()
export class ZegoTokenService {
  private readonly appID: number;
  private readonly serverSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.appID = Number(this.configService.get<string>('ZEGOCLOUD_APPID'));
    this.serverSecret = this.configService.get<string>(
      'ZEGOCLOUD_SERVERSECRET',
    );
  }

  generateOneToOneToken(
    userID: string,
    roomID: string,
    expiredNumber: number,
  ): string {
    if (!this.appID || !this.serverSecret) {
      throw new BadRequestException(
        'Cấu hình thiếu ZEGOCLOUD_APPID hoặc ZEGO_SERVER_SECRET',
      );
    }
    const payloadObject = { userId: userID, roomID };
    const payloadString = JSON.stringify(payloadObject);
    try {
      return generateToken04(
        this.appID,
        userID,
        this.serverSecret,
        expiredNumber,
        payloadString,
      );
    } catch (err: any) {
      // Nếu lỗi validate (secret không đủ 32 bytes, userID invalid, v.v.)
      throw new BadRequestException(
        err.errorMessage || 'Lỗi khi tạo Zego token',
      );
    }
  }
}
