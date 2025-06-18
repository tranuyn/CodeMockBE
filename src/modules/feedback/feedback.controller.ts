import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Feedback } from './entities/feedback.entity';
import { Public } from 'src/decorator/customize';

@Controller('feedbacks')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Public()
  @Post('create')
  create(@Body() data: Partial<Feedback>): Promise<Feedback> {
    return this.feedbackService.create(data);
  }

  @Public()
  @Get()
  findAll(): Promise<Feedback[]> {
    return this.feedbackService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Feedback> {
    return this.feedbackService.findOne(id);
  }

  @Public()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Feedback>,
  ): Promise<Feedback> {
    return this.feedbackService.update(id, data);
  }

  @Public()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.feedbackService.remove(id);
  }
}
