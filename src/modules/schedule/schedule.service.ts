import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity'; // import đúng path entity
import { CreateScheduleDto, UpdateScheduleDto } from './dtos/request.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
  ) {}

  async create(dto: CreateScheduleDto): Promise<Schedule> {
    const schedule = this.scheduleRepo.create(dto);
    return await this.scheduleRepo.save(schedule);
  }

  async update(id: string, dto: UpdateScheduleDto): Promise<Schedule> {
    const schedule = await this.scheduleRepo.findOneBy({ scheduleId: id });
    if (!schedule) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    const updated = Object.assign(schedule, dto);
    return await this.scheduleRepo.save(updated);
  }

  async findByUserId(userId: string): Promise<Schedule | null> {
    return await this.scheduleRepo.findOne({
      where: { userId },
      relations: ['interviewSessions'],
    });
  }

  async findAll(): Promise<Schedule[]> {
    return await this.scheduleRepo.find({
      relations: ['interviewSessions'],
    });
  }
}
