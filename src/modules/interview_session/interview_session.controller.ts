import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {
  CreateInterviewSessionDto,
  UpdateInterviewSessionDto,
} from './dtos/request.dto';
import { InterviewSessionService } from './interview_session.service';

@Controller('interview-sessions')
export class InterviewSessionController {
  constructor(private readonly sessionService: InterviewSessionService) {}

  @Post()
  create(@Body() dto: CreateInterviewSessionDto) {
    return this.sessionService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateInterviewSessionDto) {
    return this.sessionService.update(id, dto);
  }

  @Get('schedule/:scheduleId')
  findBySchedule(@Param('scheduleId') scheduleId: number) {
    return this.sessionService.findByScheduleId(scheduleId);
  }
}
