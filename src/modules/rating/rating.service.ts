import { Candidate } from 'src/modules/user/entities/candidate.entity';
// src/modules/rating/rating.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { InterviewSlot } from '../interview_slot/entities/interviewSlot.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepo: Repository<Rating>,
    @InjectRepository(InterviewSlot)
    private readonly slotRepo: Repository<InterviewSlot>,
  ) {}

  async create(data: Partial<Rating>): Promise<Rating> {
    const slot = await this.slotRepo.findOne({
      where: { slotId: data.slot?.slotId },
    });
    if (!slot) {
      throw new NotFoundException(
        `InterviewSlot with id ${data.slot?.slotId} not found`,
      );
    }

    const rating = this.ratingRepo.create(data);
    const saved = await this.ratingRepo.save(rating);
    // Trả về rating cùng các quan hệ đầy đủ
    return this.findOne(saved.ratingId);
  }

  async findAll(): Promise<Rating[]> {
    return this.ratingRepo.find({
      relations: ['candidate', 'slot', 'mentor', 'interviewSession'],
    });
  }

  async findOne(id: string): Promise<Rating> {
    const rating = await this.ratingRepo.findOne({
      where: { ratingId: id },
      relations: ['candidate', 'slot', 'mentor', 'interviewSession'],
    });
    if (!rating) {
      throw new NotFoundException(`Rating with id ${id} not found`);
    }
    return rating;
  }

  async update(id: string, data: Partial<Rating>): Promise<Rating> {
    const existing = await this.ratingRepo.findOneBy({ ratingId: id });
    if (!existing) {
      throw new NotFoundException(`Rating with id ${id} not found`);
    }
    await this.ratingRepo.update(id, data);
    // Trả về rating sau khi update kèm relations
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.ratingRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Rating with id ${id} not found`);
    }
  }
}
