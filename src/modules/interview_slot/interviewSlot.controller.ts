import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InterviewSlotService } from './interviewSlot.service';
import { GetUser, Public, Role, Roles } from 'src/decorator/customize';
import {
  CreateInterviewSlotDto,
  UpdateInterviewSlotDto,
} from './dtos/request.dto';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import { RoleGuard } from 'src/auth/passport/role.guard';

@Controller('interview-slot')
export class InterviewSlotController {
  constructor(
    private readonly InterviewSlotService: InterviewSlotService,
    private slotService: InterviewSlotService,
  ) {}

  @Public()
  @Post()
  create(@Body() dto: CreateInterviewSlotDto) {
    return this.InterviewSlotService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInterviewSlotDto) {
    return this.InterviewSlotService.update(id, dto);
  }

  @Public()
  @Get()
  findAll() {
    return this.InterviewSlotService.findAll();
  }

  // @Public()
  // @Get('user/:userId')
  // findByUser(@Param('userId') userId: string) {
  //   return this.InterviewSlotService.findByUserId(userId);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('my-interview-slots')
  findByUser(@GetUser('id') userId: string) {
    return this.slotService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.CANDIDATE)
  @Post(':id/register')
  async registerCandidate(
    @Param('id') slotId: string,
    @GetUser('id') candidateId: string,
  ) {
    return this.InterviewSlotService.registerCandidateToSlot(
      slotId,
      candidateId,
    );
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.CANDIDATE)
  @Patch(':id/cancel')
  async cancelSlot(
    @Param('id') slotId: string,
    @GetUser('id') candidateId: string,
  ) {
    return this.slotService.cancelSlotByCandidate(slotId, candidateId);
  }
}
