import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateInterviewSessionDto,
  UpdateInterviewSessionDto,
} from './dtos/request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { InterviewSession } from './entities/interview_session.entity';
import { InterviewSlot } from 'src/modules/interview_slot/entities/interviewSlot.entity';
import {
  INTERVIEW_SESSION_STATUS,
  INTERVIEW_SLOT_STATUS,
} from 'src/libs/constant/status';
import { User } from '../user/entities/user.entity';
import { Technology } from '../technology/technology.entity';
import { Major } from '../major/major.entity';
import { Level } from '../level/level.entity';
import { InterviewSessionResultDto } from './dtos/result.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class InterviewSessionService {
  constructor(
    @InjectRepository(InterviewSession)
    private sessionRepo: Repository<InterviewSession>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Technology)
    private technologyRepo: Repository<Technology>,

    @InjectRepository(Major)
    private majorRepo: Repository<Major>,

    @InjectRepository(Level)
    private levelRepo: Repository<Level>,
  ) {}

  async create(dto: CreateInterviewSessionDto): Promise<InterviewSession> {
    const {
      totalSlots,
      slotDuration,
      startTime,
      mentorId,
      requiredTechnologyIds,
      majorIds,
      levelId,
      ...rest
    } = dto;

    // Tìm Mentor từ ID
    const mentor = await this.userRepo.findOne({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với ID ${mentorId}`,
      );
    }

    const parsedStartTime = new Date(startTime);
    const now = new Date();
    const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    if (parsedStartTime < twoDaysLater) {
      throw new BadRequestException(
        `Ngày bắt đầu phỏng vấn phải sau thời gian hiện tại 2 ngày`,
      );
    }

    // Kiểm tra tổng thời gian hợp lệ
    if (totalSlots <= 0 || slotDuration <= 0) {
      throw new BadRequestException(
        `Số lượng slot và thời lượng mỗi slot phải lớn hơn 0`,
      );
    }

    const sessionEndTime = new Date(
      parsedStartTime.getTime() + totalSlots * slotDuration * 60 * 1000,
    );

    const queryOverlap = await this.sessionRepo
      .createQueryBuilder('session')
      .where('session.mentorId = :mentorId', { mentorId })
      .andWhere('session.startTime < :newEnd AND session.endTime > :newStart', {
        newStart: parsedStartTime.toISOString(),
        newEnd: sessionEndTime.toISOString(),
      })
      .getMany();

    if (queryOverlap.length > 0) {
      throw new BadRequestException(
        'Mentor đã có session khác trùng thời gian phỏng vấn.',
      );
    }
    const majors = await this.majorRepo.findBy({ id: In(majorIds) });
    const level = await this.levelRepo.findOne({ where: { id: levelId } });

    if (!level) {
      throw new NotFoundException(`Level không tồn tại với ID: ${levelId}`);
    }

    // Tạo các slot từ thời gian bắt đầu
    const interviewSlots: InterviewSlot[] = [];
    let currentTime = new Date(startTime);

    for (let i = 0; i < totalSlots; i++) {
      const start = new Date(currentTime);
      const end = new Date(start.getTime() + slotDuration * 60000);

      const slot = new InterviewSlot();
      slot.startTime = start;
      slot.endTime = end;
      slot.status = INTERVIEW_SLOT_STATUS.AVAILABLE;
      slot.isPaid = false;
      slot.candidate = null;

      interviewSlots.push(slot);
      currentTime = end;
    }

    const technologies = await this.technologyRepo.findBy({
      id: In(requiredTechnologyIds),
    });

    const session = this.sessionRepo.create({
      totalSlots,
      slotDuration,
      startTime: parsedStartTime,
      endTime: sessionEndTime,
      mentor,
      interviewSlots,
      level,
      majors,
      requiredTechnologies: technologies,
      ...rest,
    });

    return await this.sessionRepo.save(session);
  }

  async update(
    id: string,
    dto: UpdateInterviewSessionDto,
  ): Promise<InterviewSession> {
    const session = await this.sessionRepo.findOne({
      where: { sessionId: id },
      relations: ['mentor', 'majors', 'requiredTechnologies', 'level'],
    });

    if (!session) {
      throw new NotFoundException(`Không tìm thấy session với ID: ${id}`);
    }

    const {
      startTime,
      slotDuration,
      totalSlots,
      levelId,
      majorIds,
      requiredTechnologyIds,
      ...rest
    } = dto;

    if (startTime) {
      const parsedStartTime = new Date(startTime);
      const now = new Date();
      const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      if (parsedStartTime < twoDaysLater) {
        throw new BadRequestException(
          `Thời gian bắt đầu phỏng vấn phải sau thời điểm hiện tại ít nhất 2 ngày.`,
        );
      }

      const sessionEndTime = new Date(
        parsedStartTime.getTime() +
          (dto.totalSlots ?? session.totalSlots) *
            (dto.slotDuration ?? session.slotDuration) *
            60 *
            1000,
      );

      const overlappingSessions = await this.sessionRepo
        .createQueryBuilder('s')
        .where('s.mentorId = :mentorId', { mentorId: session.mentor.id })
        .andWhere('s.sessionId != :id', { id })
        .andWhere('s.startTime < :newEnd AND s.endTime > :newStart', {
          newStart: parsedStartTime.toISOString(),
          newEnd: sessionEndTime.toISOString(),
        })
        .getMany();

      if (overlappingSessions.length > 0) {
        throw new BadRequestException(
          'Mentor đã có session khác trùng thời gian phỏng vấn.',
        );
      }

      session.startTime = parsedStartTime;
      session.endTime = sessionEndTime;
    }

    if (slotDuration) {
      if (slotDuration <= 0) {
        throw new BadRequestException(`slotDuration phải > 0`);
      }
      session.slotDuration = slotDuration;
    }

    if (totalSlots) {
      if (totalSlots <= 0) {
        throw new BadRequestException(`totalSlots phải > 0`);
      }
      session.totalSlots = totalSlots;
    }

    if (levelId) {
      const level = await this.levelRepo.findOne({ where: { id: levelId } });
      if (!level) {
        throw new NotFoundException(`Level không tồn tại`);
      }
      session.level = level;
    }

    if (majorIds?.length) {
      const majors = await this.majorRepo.findBy({ id: In(majorIds) });
      session.majors = majors;
    }

    if (requiredTechnologyIds?.length) {
      const technologies = await this.technologyRepo.findBy({
        id: In(requiredTechnologyIds),
      });
      session.requiredTechnologies = technologies;
    }

    Object.assign(session, rest);

    return await this.sessionRepo.save(session);
  }

  async findById(id: string): Promise<InterviewSession> {
    return await this.sessionRepo.findOne({
      where: { sessionId: id },
      relations: [
        'mentor',
        'interviewSlots',
        'requiredTechnologies',
        'majors',
        'level',
      ],
    });
  }

  async findAll(): Promise<InterviewSessionResultDto[]> {
    const sessions = await this.sessionRepo.find({
      relations: [
        'mentor',
        'interviewSlots',
        'requiredTechnologies',
        'majors',
        'level',
      ],
    });
    return plainToInstance(InterviewSessionResultDto, sessions, {
      excludeExtraneousValues: true,
    });
  }

  async findByMentorId(mentorId: string): Promise<InterviewSessionResultDto[]> {
    const sessions = await this.sessionRepo.find({
      where: { mentor: { id: mentorId } },
      relations: [
        'mentor',
        'interviewSlots',
        'requiredTechnologies',
        'majors',
        'level',
      ],
    });

    return plainToInstance(InterviewSessionResultDto, sessions, {
      excludeExtraneousValues: true,
    });
  }
  async cancel(sessionId: string): Promise<InterviewSession> {
    const session = await this.sessionRepo.findOne({
      where: { sessionId },
      relations: ['interviewSlots'],
    });

    if (!session) {
      throw new NotFoundException(
        `Không tìm thấy session với ID: ${sessionId}`,
      );
    }

    const now = new Date();
    if (session.endTime && session.endTime < now) {
      throw new BadRequestException(`Không thể hủy session đã kết thúc.`);
    }

    // Cập nhật trạng thái session
    session.status = INTERVIEW_SESSION_STATUS.CANCELED;

    // Cập nhật trạng thái tất cả slot
    session.interviewSlots.forEach((slot) => {
      // Chỉ cancel những slot chưa done
      if (slot.status !== INTERVIEW_SLOT_STATUS.DONE) {
        slot.status = INTERVIEW_SLOT_STATUS.CANCELED;
      }
    });

    return await this.sessionRepo.save(session); // cascade slot update
  }
}
