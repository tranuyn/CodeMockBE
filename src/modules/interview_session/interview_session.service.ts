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

  async update(id: string, dto: UpdateInterviewSessionDto) {
    await this.sessionRepo.update(id, dto);
    return await this.sessionRepo.findOne({ where: { sessionId: id } });
  }

  async findById(id: string) {
    return await this.sessionRepo.findOne({ where: { sessionId: id } });
  }

  async findByScheduleId(scheduleId: string) {
    return await this.sessionRepo.find({ where: { scheduleId } });
  }

  async delete(id: string) {
    return await this.sessionRepo.delete(id);
  }
}
