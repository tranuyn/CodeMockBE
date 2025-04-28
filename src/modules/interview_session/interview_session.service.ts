import { Injectable } from '@nestjs/common';
import {
  CreateInterviewSessionDto,
  UpdateInterviewSessionDto,
} from './dtos/request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewSession } from './entities/interview_session.entity';

@Injectable()
export class InterviewSessionService {
  constructor(
    @InjectRepository(InterviewSession)
    private sessionRepo: Repository<InterviewSession>,
  ) {}

  async create(dto: CreateInterviewSessionDto) {
    const session = this.sessionRepo.create(dto);
    return await this.sessionRepo.save(session);
  }

  async update(id: number, dto: UpdateInterviewSessionDto) {
    await this.sessionRepo.update(id, dto);
    return await this.sessionRepo.findOne({ where: { sessionId: id } });
  }

  async findById(id: number) {
    return await this.sessionRepo.findOne({ where: { sessionId: id } });
  }

  async findByScheduleId(scheduleId: number) {
    return await this.sessionRepo.find({ where: { scheduleId } });
  }

  async delete(id: number) {
    return await this.sessionRepo.delete(id);
  }
}
