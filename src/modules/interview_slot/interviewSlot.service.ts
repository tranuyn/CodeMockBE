import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewSlot } from './entities/interviewSlot.entity';
import {
  CreateInterviewSlotDto,
  UpdateInterviewSlotDto,
} from './dtos/request.dto';
import { INTERVIEW_SLOT_STATUS } from 'src/libs/constant/status';
import { UserService } from '../user/user.service';
import { Candidate } from '../user/entities/candidate.entity';

@Injectable()
export class InterviewSlotService {
  constructor(
    @InjectRepository(InterviewSlot)
    private readonly interviewSlotRepo: Repository<InterviewSlot>,
    private userService: UserService,
  ) {}

  async create(dto: CreateInterviewSlotDto): Promise<InterviewSlot> {
    const interviewSlot = this.interviewSlotRepo.create(dto);
    return await this.interviewSlotRepo.save(interviewSlot);
  }

  async update(
    id: string,
    dto: UpdateInterviewSlotDto,
  ): Promise<InterviewSlot> {
    const interviewSlot = await this.interviewSlotRepo.findOne({
      where: { slotId: id },
    });

    if (!interviewSlot) {
      throw new NotFoundException(`Interview slot with ID ${id} not found`);
    }

    const updated = Object.assign(interviewSlot, dto);
    return await this.interviewSlotRepo.save(updated);
  }

  async findByUserId(candidateId: string): Promise<InterviewSlot[]> {
    return await this.interviewSlotRepo.find({
      where: { candidate: { id: candidateId } },
      relations: ['interviewSession', 'feedback'],
    });
  }

  async findAll(): Promise<InterviewSlot[]> {
    return await this.interviewSlotRepo.find({
      relations: ['interviewSession', 'feedback'],
    });
  }

  async findBySessionId(sessionId: string): Promise<InterviewSlot[]> {
    return await this.interviewSlotRepo.find({
      where: { interviewSession: { sessionId: sessionId } }, // Sử dụng đúng tên thuộc tính
      relations: ['feedback'], // Đảm bảo feedback cũng là một mối quan hệ trong InterviewSlot
    });
  }

  async findOne(id: string): Promise<InterviewSlot> {
    const slot = await this.interviewSlotRepo.findOne({
      where: { slotId: id },
      relations: ['interviewSession', 'candidate', 'feedback'],
    });

    if (!slot) {
      throw new NotFoundException(`Interview slot with ID ${id} not found`);
    }

    return slot;
  }

  async delete(id: string): Promise<void> {
    const result = await this.interviewSlotRepo.delete({ slotId: id });

    if (result.affected === 0) {
      throw new NotFoundException(`Interview slot with ID ${id} not found`);
    }
  }

  async registerCandidateToSlot(
    slotId: string,
    candidateId: string,
  ): Promise<InterviewSlot> {
    const slot = await this.interviewSlotRepo.findOne({
      where: { slotId },
      relations: ['interviewSession'],
    });

    if (!slot) {
      throw new NotFoundException(`Không tìm thấy slot với ID ${slotId}`);
    }

    if (slot.status !== INTERVIEW_SLOT_STATUS.AVAILABLE) {
      throw new BadRequestException(`Slot không khả dụng`);
    }

    const sessionId = slot.interviewSession.sessionId;
    const existingSlot = await this.interviewSlotRepo.findOne({
      where: {
        candidate: { id: candidateId },
        interviewSession: { sessionId },
      },
    });

    if (existingSlot) {
      throw new BadRequestException(
        `Bạn đã đăng ký một slot trong session này rồi`,
      );
    }

    slot.candidate = { id: candidateId } as Candidate;
    slot.status = INTERVIEW_SLOT_STATUS.BOOKED;
    return await this.interviewSlotRepo.save(slot);
  }

  async cancelSlotByCandidate(
    slotId: string,
    candidateId: string,
  ): Promise<InterviewSlot> {
    const slot = await this.interviewSlotRepo.findOne({
      where: { slotId },
      relations: ['candidate'],
    });

    if (!slot) {
      throw new NotFoundException(`Không tìm thấy slot với ID ${slotId}`);
    }

    // đã dùng jwt nên đoạn này ko cần
    // if (slot.candidateId !== candidateId) {
    //   throw new ForbiddenException(`Bạn không có quyền hủy slot này`);
    // }

    const now = new Date();
    const startTime = new Date(slot.startTime);
    const diffInHours =
      (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours >= 48) {
      // Hủy đúng hạn → reset slot
      slot.status = INTERVIEW_SLOT_STATUS.AVAILABLE;
      slot.candidate = null;
      slot.isPaid = false;
    } else {
      // Hủy trễ → vẫn giữ candidateId, đánh dấu vi phạm
      slot.status = INTERVIEW_SLOT_STATUS.CANCELED_LATE;

      // Cộng warning_count cho user
      await this.userService.incrementWarningCount(candidateId);
    }

    return await this.interviewSlotRepo.save(slot);
  }
}
