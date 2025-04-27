import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateScheduleDto, UpdateScheduleDto } from './dtos/request.dto';
import { ScheduleService } from './schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.scheduleService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateScheduleDto) {
    return this.scheduleService.update(id, dto);
  }

  @Get(':userId')
  findByUser(@Param('userId') userId: number) {
    return this.scheduleService.findByUserId(userId);
  }
}
