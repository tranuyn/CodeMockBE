import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { InterviewSlotService } from './interviewSlot.service';
import { Public } from 'src/decorator/customize';
import {
  CancelInterviewSlotDto,
  CreateInterviewSlotDto,
  RegisterInterviewSlotDto,
  UpdateInterviewSlotDto,
} from './dtos/request.dto';

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

  @Public()
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.InterviewSlotService.findByUserId(userId);
  }

  @Public()
  @Put(':id/register')
  async registerCandidate(
    @Param('id') slotId: string,
    @Body() dto: RegisterInterviewSlotDto,
  ) {
    return this.InterviewSlotService.registerCandidateToSlot(
      slotId,
      dto.candidateId,
    );
  }

  @Public()
  @Put(':id/cancel')
  async cancelSlot(
    @Param('id') slotId: string,
    @Body() dto: CancelInterviewSlotDto,
  ) {
    return this.slotService.cancelSlotByCandidate(slotId, dto.candidateId);
  }
}
