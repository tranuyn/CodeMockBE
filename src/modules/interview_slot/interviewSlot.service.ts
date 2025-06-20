import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewSlot } from './entities/interviewSlot.entity';
import {
  CreateInterviewSlotDto,
  RegisterInterviewSlotDto,
  SearchInterviewSlotRequest,
  UpdateInterviewSlotDto,
} from './dtos/request.dto';
import { INTERVIEW_SLOT_STATUS } from 'src/libs/constant/status';
import { UserService } from '../user/user.service';
import { Candidate } from '../user/entities/candidate.entity';
import { Result } from 'src/common/dtos/result.dto';
import { SortField } from 'src/common/enums/sortField';
import { SortOrder } from 'src/common/enums/sortOder';
import { paginate } from 'src/libs/utils/paginate';
import { InterviewSlotResultDto } from './dtos/result.dto';
import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

@Injectable()
export class InterviewSlotService {
  constructor(
    @InjectRepository(InterviewSlot)
    private readonly interviewSlotRepo: Repository<InterviewSlot>,
    private userService: UserService,
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,
    private readonly dataSource: DataSource,
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
      relations: [
        'interviewSession',
        'interviewSession.mentor',
        'interviewSession.level',
        'interviewSession.majors',
        'interviewSession.requiredTechnologies',
        'interviewSession.interviewSlots',
        'feedback',
      ],
    });
  }

  async findAll(): Promise<InterviewSlot[]> {
    return await this.interviewSlotRepo.find({
      relations: ['interviewSession', 'feedback', 'rating'],
    });
  }

  async findBySessionId(sessionId: string): Promise<InterviewSlot[]> {
    return await this.interviewSlotRepo.find({
      where: { interviewSession: { sessionId: sessionId } },
      relations: ['feedback'],
    });
  }

  async findById(id: string): Promise<InterviewSlotResultDto> {
    const slot = await this.interviewSlotRepo.findOne({
      where: { slotId: id },
      relations: ['interviewSession', 'candidate', 'feedback', 'rating'],
    });

    if (!slot) {
      throw new NotFoundException(`Interview slot with ID ${id} not found`);
    }

    // Map InterviewSlot entity to InterviewSlotResultDto
    return plainToInstance(InterviewSlotResultDto, slot, {
      excludeExtraneousValues: true,
    });
  }

  async searchSlot(query: SearchInterviewSlotRequest) {
    const qb = this.interviewSlotRepo
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.interviewSession', 'session')
      .leftJoinAndSelect('session.mentor', 'mentor')
      .leftJoinAndSelect('session.requiredTechnologies', 'requiredTechnologies')
      .leftJoinAndSelect('session.majors', 'majors')
      .leftJoinAndSelect('session.level', 'level')
      .leftJoinAndSelect('slot.feedback', 'feedback')
      .leftJoinAndSelect('slot.rating', 'rating')
      .leftJoinAndSelect('slot.candidate', 'candidate');

    if (query.candidateId) {
      qb.andWhere('candidate.id = :candidateId', {
        candidateId: query.candidateId,
      });
    }

    qb.andWhere('slot.status = :status', {
      status: INTERVIEW_SLOT_STATUS.DONE,
    });

    if (query.levelId) {
      qb.andWhere('level.id = :levelId', { levelId: query.levelId });
    }
    if (query.majorIds) {
      const majorIdsArray = query.majorIds.split(',').map((id) => id.trim());
      if (majorIdsArray.length > 0) {
        qb.andWhere('majors.id IN (:...majorIds)', { majorIds: majorIdsArray });
      }
    }
    if (query.slotDuration !== undefined) {
      qb.andWhere('session.slotDuration = :slotDuration', {
        slotDuration: query.slotDuration,
      });
    }

    if (query.slotDuration !== undefined) {
      qb.andWhere('session.slotDuration = :slotDuration', {
        slotDuration: query.slotDuration,
      });
    }

    if (query.isFree !== undefined) {
      if (query.isFree) {
        qb.andWhere('session.sessionPrice = 0');
      } else {
        qb.andWhere('session.sessionPrice > 0');
      }
    }

    const sortFieldMap: Record<SortField, string> = {
      [SortField.CREATED_AT]: 'slot.updatedAt',
      [SortField.START_TIME]: 'slot.startTime',
      [SortField.TITLE]: '',
      [SortField.UPDATED_AT]: 'slot.updatedAt',
    };

    const sortField = sortFieldMap[query.sortField || SortField.CREATED_AT];
    const sortOrder = query.sortOrder === SortOrder.ASC ? 'ASC' : 'DESC';

    return paginate<InterviewSlot, InterviewSlotResultDto>(
      () =>
        qb
          .orderBy(sortField, sortOrder)
          .skip((query.pageNumber - 1) * query.pageSize)
          .take(query.pageSize)
          .getManyAndCount(),
      query.pageSize,
      query.pageNumber,
      (entity) =>
        plainToInstance(InterviewSlotResultDto, entity, {
          excludeExtraneousValues: true,
        }),
    );
  }

  async delete(id: string): Promise<void> {
    const result = await this.interviewSlotRepo.delete({ slotId: id });

    if (result.affected === 0) {
      throw new NotFoundException(`Interview slot with ID ${id} not found`);
    }
  }

  async registerCandidateToSlot(
    slotId: string,
    dto: RegisterInterviewSlotDto,
  ): Promise<InterviewSlot> {
    const { candidateId, resumeUrl, payByCodemockCoin } = dto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const slot = await queryRunner.manager.findOne(InterviewSlot, {
        where: { slotId },
        relations: ['interviewSession'],
      });

      if (!slot) {
        throw new NotFoundException(`Không tìm thấy slot với ID ${slotId}`);
      }

      if (
        slot.status !== INTERVIEW_SLOT_STATUS.AVAILABLE &&
        !(
          slot.status === INTERVIEW_SLOT_STATUS.WAITING &&
          slot.candidateWaitToPay === candidateId
        )
      ) {
        throw new BadRequestException(`Slot không khả dụng`);
      }

      const sessionId = slot.interviewSession.sessionId;
      const existingSlot = await queryRunner.manager.findOne(InterviewSlot, {
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

      const newSlotStart = new Date(slot.startTime);
      const newSlotEnd = new Date(slot.endTime);

      const candidateSlots = await queryRunner.manager.find(InterviewSlot, {
        where: {
          candidate: { id: candidateId },
          status: INTERVIEW_SLOT_STATUS.BOOKED,
        },
        relations: ['interviewSession'],
      });

      const hasTimeConflict = candidateSlots.some((existing) => {
        const existingStart = new Date(existing.startTime);
        const existingEnd = new Date(existing.endTime);
        return existingStart < newSlotEnd && existingEnd > newSlotStart;
      });

      if (hasTimeConflict) {
        throw new BadRequestException(
          'Bạn đã có một slot khác trùng thời gian với slot này.',
        );
      }

      slot.candidate = { id: candidateId } as Candidate;
      slot.status = INTERVIEW_SLOT_STATUS.BOOKED;

      // ✅ Thêm dòng này để lưu resumeUrl nếu có
      if (resumeUrl) {
        slot.resumeUrl = resumeUrl;
      }

      if (payByCodemockCoin) {
        const candidate = await queryRunner.manager.findOne(Candidate, {
          where: { id: candidateId },
        });

        if (!candidate) {
          throw new NotFoundException('Không tìm thấy ứng viên');
        }

        const price = slot.interviewSession.sessionPrice || 0;

        if (candidate.coinBalance < price) {
          throw new BadRequestException(
            'Bạn không đủ coin để thanh toán slot này.',
          );
        }

        candidate.coinBalance -= price;
        await queryRunner.manager.save(candidate);
      }
      const savedSlot = await queryRunner.manager.save(slot);

      // 8. Commit transaction
      await queryRunner.commitTransaction();
      return savedSlot;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelSlotByCandidate(
    slotId: string,
    candidateId: string,
    cancelReason: string,
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
      slot.cancelReason = null;
      const userExisting = this.userService.findOne(candidateId);
      await this.userService.update(candidateId, {
        coinBalance:
          slot.interviewSession.sessionPrice + (await userExisting).coinBalance,
      });
    } else {
      // Hủy trễ → vẫn giữ candidateId, đánh dấu vi phạm
      slot.status = INTERVIEW_SLOT_STATUS.CANCELED_LATE;
      slot.cancelReason = cancelReason;

      // Cộng warning_count cho user
      await this.userService.incrementWarningCount(candidateId);
    }

    return await this.interviewSlotRepo.save(slot);
  }
}
