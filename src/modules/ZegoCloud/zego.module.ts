// src/zego/zego.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ZegoTokenService } from './zegoCloudService';

@Module({
  imports: [ConfigModule],
  providers: [ZegoTokenService],
  exports: [ZegoTokenService],
})
export class ZegoModule {}
