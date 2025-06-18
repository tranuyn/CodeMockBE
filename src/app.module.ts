import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MajorModule } from './modules/major/major.module';
import { LevelModule } from './modules/level/level.module';
import { TechnologyModule } from './modules/technology/level.module';
import { InterviewSessionModule } from './modules/interview_session/interview_session.module';
import { InterviewSlotModule } from './modules/interview_slot/interviewSlot.module';
import { RatingModule } from './modules/rating/rating.modules';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Chia sẻ biến môi trường cho toàn bộ ứng dụng
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('SUPABASE_DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        migrationsRun: false,
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsTableName: 'migrations',
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    MailerModule,
    MajorModule,
    LevelModule,
    InterviewSessionModule,
    InterviewSlotModule,
    TechnologyModule,
    RatingModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          requireTLS: true,
          host: 'smtp.gmail.com',
          port: 587,
          ignoreTLS: true,
          secure: false,
          service: 'gmail',
          auth: {
            user: configService.get('MAILDEV_INCOMING_USER'),
            pass: configService.get('MAILDEV_INCOMING_PASS'),
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@localhost>',
        },
        template: {
          dir: join(__dirname, '../mail_template'),
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
