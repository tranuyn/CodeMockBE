import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from 'src/modules/feedback/entities/feedback.entity';
import { InterviewSlot } from '../interview_slot/entities/interviewSlot.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepo: Repository<Feedback>,
    @InjectRepository(InterviewSlot)
    private readonly slotRepo: Repository<InterviewSlot>,
  ) {}

  async create(data: Partial<Feedback>): Promise<Feedback> {
    const slot = await this.slotRepo.findOne({
      where: { slotId: data.slot?.slotId },
    });
    if (!slot) {
      throw new NotFoundException(
        `InterviewSlot with id ${data.slot?.slotId} not found`,
      );
    }

    const rating = this.feedbackRepo.create(data);
    const saved = await this.feedbackRepo.save(rating);
    // Trả về rating cùng các quan hệ đầy đủ
    return this.findOne(saved.feedbackId);
  }

  async findAll(): Promise<Feedback[]> {
    return this.feedbackRepo.find({
      relations: ['slot', 'session'],
    });
  }

  async findOne(id: string): Promise<Feedback> {
    const Feedback = await this.feedbackRepo.findOne({
      where: { feedbackId: id },
      relations: ['slot', 'session'],
    });
    if (!Feedback) {
      throw new NotFoundException(`Feedback with id ${id} not found`);
    }
    return Feedback;
  }

  async update(id: string, data: Partial<Feedback>): Promise<Feedback> {
    const existing = await this.feedbackRepo.findOneBy({ feedbackId: id });
    if (!existing) {
      throw new NotFoundException(`Feedback with id ${id} not found`);
    }
    await this.feedbackRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.feedbackRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Feedback with id ${id} not found`);
    }
  }
}
