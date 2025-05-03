import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  CreateInterviewSessionDto,
  UpdateInterviewSessionDto,
} from './dtos/request.dto';
import { InterviewSessionService } from './interview_session.service';
import { Public, Role, Roles } from 'src/decorator/customize';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import { RoleGuard } from 'src/auth/passport/role.guard';

@Controller('interview_sessions')
export class InterviewSessionController {
  constructor(private readonly sessionService: InterviewSessionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.CANDIDATE, Role.ADMIN)
  create(@Body() dto: CreateInterviewSessionDto) {
    return this.sessionService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.CANDIDATE, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateInterviewSessionDto) {
    return this.sessionService.update(id, dto);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionService.findById(id);
  }

  @Get('schedule/:scheduleId')
  findBySchedule(@Param('scheduleId') scheduleId: string) {
    return this.sessionService.findByScheduleId(scheduleId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.sessionService.delete(id);
  }
}
