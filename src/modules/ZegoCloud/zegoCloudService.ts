import { ConfigService } from '@nestjs/config';
import { Injectable, BadRequestException } from '@nestjs/common';
import { generateToken04 } from './zegocloudAssistant';
import * as crypto from 'crypto';

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

    const payloadObject = {
      room_id: roomID,
      privilege: {
        1: 1, // loginRoom: 1 pass , 0 not pass
        2: 0, // publishStream: 1 pass , 0 not pass
      },
      stream_id_list: null,
    };
    const payload = JSON.stringify(payloadObject);
    try {
      return generateToken04(
        this.appID,
        userID,
        this.serverSecret,
        expiredNumber,
        payload,
      );
    } catch (err: any) {
      // Nếu lỗi validate (secret không đủ 32 bytes, userID invalid, v.v.)
      throw new BadRequestException(
        err.errorMessage || 'Lỗi khi tạo Zego token',
      );
    }
  }

  generateToken(userId: string, roomId: string, expireTime?: number): string {
    const currentTime = Math.floor(Date.now() / 1000);
    const expire = expireTime || currentTime + 3600; // 1 hour default

    const payload = {
      iss: 'zego',
      exp: expire,
      room_id: roomId,
      user_id: userId,
      privilege: {
        room: 1, // join room
        video: 1, // publish video
        audio: 1, // publish audio
      },
    };

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
      'base64url',
    );
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );

    const signature = crypto
      .createHmac('sha256', this.serverSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}
