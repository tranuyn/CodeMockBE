import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  CreateInterviewSessionDto,
  UpdateInterviewSessionDto,
} from './dtos/request.dto';
import { InterviewSessionService } from './interview_session.service';
import { GetUser, Public, Role, Roles } from 'src/decorator/customize';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import { RoleGuard } from 'src/auth/passport/role.guard';

@Controller('interview_sessions')
export class InterviewSessionController {
  constructor(private readonly sessionService: InterviewSessionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.MENTOR, Role.ADMIN)
  create(@Body() dto: CreateInterviewSessionDto) {
    return this.sessionService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.MENTOR, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateInterviewSessionDto) {
    return this.sessionService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-interview-sessions')
  findMySessions(@GetUser('id') userId: string) {
    return this.sessionService.findByMentorId(userId);
  }

  @Public()
  @Get()
  findAll() {
    return this.sessionService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sessionService.findById(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.sessionService.cancel(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.CANDIDATE)
  @Post(':id/checkRegister')
  async isCandidateRegisteredInSession(
    @Param('id') sessionId: string,
    @GetUser('id') candidateId: string,
  ) {
    return this.sessionService.isCandidateRegisteredInSession(
      sessionId,
      candidateId,
    );
  }
}
