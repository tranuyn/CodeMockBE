import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../modules/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './passport/local.strategy';
import { JwtStrategy } from './passport/jwt.strategy';
import { MajorModule } from 'src/modules/major/major.module';
import { LevelModule } from 'src/modules/level/level.module';
import { TechnologyModule } from 'src/modules/technology/level.module';
import { Major } from 'src/modules/major/major.entity';
import { Level } from 'src/modules/level/level.entity';
import { Technology } from 'src/modules/technology/technology.entity';

@Module({
  imports: [
    UserModule,
    MajorModule,
    LevelModule,
    TechnologyModule,
    TypeOrmModule.forFeature([User, Major, Level, Technology]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRED'),
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
