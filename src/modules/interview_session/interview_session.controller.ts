import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import {
  CreateInterviewSessionDto,
  UpdateInterviewSessionDto,
} from './dtos/request.dto';
import { InterviewSessionService } from './interview_session.service';
import { Public } from 'src/decorator/customize';

@Controller('interview_sessions')
export class InterviewSessionController {
  constructor(private readonly sessionService: InterviewSessionService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateInterviewSessionDto) {
    return this.sessionService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateInterviewSessionDto) {
    return this.sessionService.update(id, dto);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.sessionService.findById(id);
  }

  @Get('schedule/:scheduleId')
  findBySchedule(@Param('scheduleId') scheduleId: number) {
    return this.sessionService.findByScheduleId(scheduleId);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.sessionService.delete(id);
  }
}
