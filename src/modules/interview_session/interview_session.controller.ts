import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import {
  CreateInterviewSessionDto,
  SearchInterviewSessionRequest,
  UpdateInterviewSessionDto,
} from './dtos/request.dto';
import { InterviewSessionService } from './interview_session.service';
import { GetUser, Public, Roles } from 'src/decorator/customize';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import { RoleGuard } from 'src/auth/passport/role.guard';
import { Result } from 'src/common/dtos/result.dto';
import { ROLE } from 'src/common/enums/role.enum';

@Controller('interview_sessions')
export class InterviewSessionController {
  constructor(private readonly sessionService: InterviewSessionService) {}
  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(ROLE.MENTOR, ROLE.ADMIN)
  create(@Body() dto: CreateInterviewSessionDto) {
    return this.sessionService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(ROLE.MENTOR, ROLE.ADMIN)
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
  @Get('search')
  async search(@Query() query: SearchInterviewSessionRequest): Promise<Result> {
    return await this.sessionService.search(query);
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
  @Roles(ROLE.CANDIDATE)
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

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('/:id/joinMeeting')
  async joinMeeting(
    @Param('id') id: string,
    @Query('expireSeconds') expireSeconds: number,
    @GetUser('id') userId: string,
  ) {
    return this.sessionService.joinMeeting(id, expireSeconds, userId);
  }
}
