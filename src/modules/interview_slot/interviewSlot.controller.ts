import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { InterviewSlotService } from './interviewSlot.service';
import { Public } from 'src/decorator/customize';
import {
  CreateInterviewSlotDto,
  UpdateInterviewSlotDto,
} from './dtos/request.dto';

@Controller('interviewSlot')
export class InterviewSlotController {
  constructor(private readonly InterviewSlotService: InterviewSlotService) {}

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

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.InterviewSlotService.findByUserId(userId);
  }
}
