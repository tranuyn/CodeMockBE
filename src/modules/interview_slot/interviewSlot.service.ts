import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewSlot } from './entities/interviewSlot.entity';
import {
  CreateInterviewSlotDto,
  UpdateInterviewSlotDto,
} from './dtos/request.dto';

@Injectable()
export class InterviewSlotService {
  constructor(
    @InjectRepository(InterviewSlot)
    private interviewSlotRepo: Repository<InterviewSlot>,
  ) {}

  async create(dto: CreateInterviewSlotDto): Promise<InterviewSlot> {
    const interviewSlot = this.interviewSlotRepo.create(dto);
    return await this.interviewSlotRepo.save(interviewSlot);
  }

  async update(
    id: string,
    dto: UpdateInterviewSlotDto,
  ): Promise<InterviewSlot> {
    const interviewSlot = await this.interviewSlotRepo.findOneBy({
      interviewSlotId: id,
    });
    if (!interviewSlot) {
      throw new Error(`Schedule with ID ${id} not found`);
    }
    const updated = Object.assign(interviewSlot, dto);
    return await this.interviewSlotRepo.save(updated);
  }

  async findByUserId(userId: string): Promise<InterviewSlot | null> {
    return await this.interviewSlotRepo.findOne({
      where: { userId },
      relations: ['interviewSessions'],
    });
  }

  async findAll(): Promise<InterviewSlot[]> {
    return await this.interviewSlotRepo.find({
      relations: ['interviewSessions'],
    });
  }
}
