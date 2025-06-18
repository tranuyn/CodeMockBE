import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MoMoPaymentService } from './momo-payment.service';
import { MoMoPaymentController } from './momo-payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewSlot } from '../interview_slot/entities/interviewSlot.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([InterviewSlot])],
  controllers: [MoMoPaymentController],
  providers: [MoMoPaymentService],
  exports: [MoMoPaymentService],
})
export class MoMoPaymentModule {}
