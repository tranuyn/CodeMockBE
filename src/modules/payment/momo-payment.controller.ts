import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  MoMoPaymentService,
  MoMoPaymentRequest,
  CheckPaymentQueryDto,
} from './momo-payment.service';
import { Public } from 'src/decorator/customize';

@Controller('momo')
export class MoMoPaymentController {
  constructor(private readonly momoPaymentService: MoMoPaymentService) {}

  @Public()
  @Post('create-payment')
  async createPayment(@Body() paymentData: MoMoPaymentRequest) {
    return await this.momoPaymentService.createPayment(paymentData);
  }

  @Public()
  @Post('ipn')
  async handleIPN(@Body() ipnData: any) {
    // Verify signature
    const isValidSignature = this.momoPaymentService.verifySignature(ipnData);

    if (!isValidSignature) {
      return { status: 'error', message: 'Invalid signature' };
    }

    if (ipnData.resultCode === 0) {
      console.log('Payment successful for order:', ipnData.orderId);
    } else {
      console.log('Payment failed for order:', ipnData.orderId);
    }

    return { status: 'success' };
  }

  @Public()
  @Get('return')
  async handleReturn(@Query() returnData: any) {
    if (returnData.resultCode === '0') {
      return { message: 'Payment successful!', data: returnData };
    } else {
      return { message: 'Payment failed!', data: returnData };
    }
  }

  @Public()
  @Get('check-payment')
  async checkPayment(@Query() query: CheckPaymentQueryDto) {
    try {
      const { orderInfo, resultCode } = query;

      const result = await this.momoPaymentService.checkPayment(
        orderInfo,
        resultCode,
      );

      return {
        statusCode: HttpStatus.OK,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message || 'Payment check failed',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
