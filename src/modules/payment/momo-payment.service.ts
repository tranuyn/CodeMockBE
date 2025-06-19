import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { InterviewSlot } from '../interview_slot/entities/interviewSlot.entity';
import { Repository } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { INTERVIEW_SLOT_STATUS } from 'src/libs/constant/status';

export interface MoMoPaymentRequest {
  amount: string;
  orderInfo?: string;
  redirectUrl?: string;
  ipnUrl?: string;
  extraData?: string;
}

export interface MoMoPaymentResponse {
  partnerCode: string;
  requestId: string;
  orderId: string;
  amount: string;
  responseTime: number;
  message: string;
  payUrl?: string;
  shortLink?: string;
}

export class CheckPaymentQueryDto {
  @IsString()
  @IsNotEmpty()
  orderInfo: string;

  @IsString()
  @IsNotEmpty()
  resultCode: string;
}

@Injectable()
export class MoMoPaymentService {
  private readonly partnerCode = 'MOMO';
  private readonly accessKey = 'F8BBA842ECF85';
  private readonly secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
  private readonly momoApiUrl =
    'https://test-payment.momo.vn/v2/gateway/api/create';

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(InterviewSlot)
    private readonly slotRepo: Repository<InterviewSlot>,
  ) {}

  async createPayment(
    paymentData: MoMoPaymentRequest,
  ): Promise<MoMoPaymentResponse> {
    try {
      // Generate unique IDs
      const requestId = this.partnerCode + new Date().getTime();
      const orderId = requestId;

      // Default values
      const amount = paymentData.amount;
      const orderInfo = paymentData.orderInfo || 'pay with MoMo';
      const redirectUrl = 'https://localhost:3000/check-payment'; // FE
      const ipnUrl = 'http://localhost:8081/check-payment'; //BE
      const requestType = 'captureWallet';
      const extraData = paymentData.extraData || '';

      // Create raw signature
      const rawSignature = this.createRawSignature({
        accessKey: this.accessKey,
        amount,
        extraData,
        ipnUrl,
        orderId,
        orderInfo,
        partnerCode: this.partnerCode,
        redirectUrl,
        requestId,
        requestType,
      });

      // Generate signature
      const signature = this.generateSignature(rawSignature);

      // Prepare request body
      const requestBody = {
        partnerCode: this.partnerCode,
        accessKey: this.accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData,
        requestType,
        signature,
        lang: 'en',
      };

      const response = await firstValueFrom(
        this.httpService.post<MoMoPaymentResponse>(
          this.momoApiUrl,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const slotId = paymentData.orderInfo;
      const timeoutDuration = (1 * 60 + 45) * 60 * 1000; // 1 giờ 45 p
      const slot = await this.slotRepo.findOne({ where: { slotId } });
      slot.status = INTERVIEW_SLOT_STATUS.WAITING;
      await this.slotRepo.save(slot);

      setTimeout(async () => {
        if (slot && !slot.isPaid) {
          slot.status = INTERVIEW_SLOT_STATUS.AVAILABLE;
          await this.slotRepo.save(slot);
          console.log(
            `Slot ${slotId} has been canceled due to payment timeout`,
          );
        }
      }, timeoutDuration);

      if (response.data.payUrl) {
        console.log('payUrl: ');
        console.log(response.data.payUrl);
      }

      return response.data;
    } catch (error) {
      console.error(`Problem with request: ${error.message}`);
      throw new HttpException(
        `MoMo payment creation failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private createRawSignature(params: {
    accessKey: string;
    amount: string;
    extraData: string;
    ipnUrl: string;
    orderId: string;
    orderInfo: string;
    partnerCode: string;
    redirectUrl: string;
    requestId: string;
    requestType: string;
  }): string {
    return `accessKey=${params.accessKey}&amount=${params.amount}&extraData=${params.extraData}&ipnUrl=${params.ipnUrl}&orderId=${params.orderId}&orderInfo=${params.orderInfo}&partnerCode=${params.partnerCode}&redirectUrl=${params.redirectUrl}&requestId=${params.requestId}&requestType=${params.requestType}`;
  }

  private generateSignature(rawSignature: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');
  }

  // Method to verify IPN callback signature
  verifySignature(data: any): boolean {
    const {
      accessKey,
      amount,
      extraData,
      message,
      orderId,
      orderInfo,
      orderType,
      partnerCode,
      payType,
      requestId,
      responseTime,
      resultCode,
      transId,
      signature,
    } = data;

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = this.generateSignature(rawSignature);

    return signature === expectedSignature;
  }

  async checkPayment(orderInfo: string, resultCode: string): Promise<any> {
    // Kiểm tra nếu payment thành công
    if (resultCode === '0') {
      // Extract cart ID từ orderInfo (lấy từ ký tự thứ 1 đến 9999)
      const idSlot = orderInfo;

      // Tìm cart trong database
      const slot = await this.slotRepo.findOne({ where: { slotId: idSlot } });

      console.log('slot', idSlot);

      if (!slot) {
        throw new NotFoundException(`Slot with ID ${idSlot} not found`);
      }

      slot.isPaid = true;
      await this.slotRepo.save(slot);

      return {
        success: true,
        message: 'Payment successful',
        slot: slot,
        slotId: idSlot,
      };
    }

    return {
      success: false,
      message: 'Payment failed or cancelled',
      resultCode,
    };
  }
}
