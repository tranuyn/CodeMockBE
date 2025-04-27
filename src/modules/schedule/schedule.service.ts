import { Injectable } from '@nestjs/common';
import { CreateScheduleDto, UpdateScheduleDto } from './dtos/request.dto';

@Injectable()
export class ScheduleService {
  private schedules = [];

  create(dto: CreateScheduleDto) {
    const newSchedule = {
      scheduleId: Date.now(), // mock
      ...dto,
    };
    this.schedules.push(newSchedule);
    return newSchedule;
  }

  update(id: number, dto: UpdateScheduleDto) {
    const index = this.schedules.findIndex(s => s.scheduleId === id);
    if (index === -1) return null;

    this.schedules[index] = { ...this.schedules[index], ...dto };
    return this.schedules[index];
  }

  findByUserId(userId: number) {
    return this.schedules.find(s => s.userId === userId);
  }
}
