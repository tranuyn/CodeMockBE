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
import { INTERVIEW_SLOT_STATUS } from 'src/libs/constant/status';
import { User } from '../user/entities/user.entity';
import { Technology } from '../technology/technology.entity';

@Injectable()
export class InterviewSessionService {
  constructor(
    @InjectRepository(InterviewSession)
    private sessionRepo: Repository<InterviewSession>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Technology)
    private technologyRepo: Repository<Technology>,
  ) {}

  async create(dto: CreateInterviewSessionDto): Promise<InterviewSession> {
    const { duration, slotDuration, scheduleDateTime, mentorId, ...rest } = dto;
    const mentor = await this.userRepo.findOne({ where: { id: mentorId } });

    if (!mentor) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với ID ${mentorId}`,
      );
    }

    if (mentor.role !== 'MENTOR') {
      throw new BadRequestException(
        'Chỉ người dùng có vai trò MENTOR mới được tạo session',
      );
    }
    const totalSlots = Math.floor(duration / slotDuration);

    if (totalSlots <= 0) {
      throw new BadRequestException(
        `Không thể tạo session vì tổng thời gian (${duration} phút) nhỏ hơn thời lượng slot (${slotDuration} phút).`,
      );
    }

    const interviewSlots: InterviewSlot[] = [];
    let currentTime = new Date(scheduleDateTime);
    const technologies = await this.technologyRepo.findBy({
      id: In(dto.requiredTechnologyIds),
    });
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

    const session = this.sessionRepo.create({
      duration,
      slotDuration,
      scheduleDateTime,
      mentorId: mentor.id,
      mentor,
      interviewSlots,
      requiredTechnologies: technologies,
      ...rest,
    });

    return await this.sessionRepo.save(session);
  }

  async update(
    id: string,
    dto: UpdateInterviewSessionDto,
  ): Promise<InterviewSession> {
    await this.sessionRepo.update(id, dto);
    return await this.sessionRepo.findOne({
      where: { sessionId: id },
      relations: ['interviewSlots'],
    });
  }

  async findById(id: string): Promise<InterviewSession> {
    return await this.sessionRepo.findOne({
      where: { sessionId: id },
      relations: ['interviewSlots', 'technologies'],
    });
  }

  async findAll(): Promise<InterviewSession[]> {
    return await this.sessionRepo.find({
      relations: ['interviewSlots', 'technologies'],
    });
  }

  async findByMentorId(mentorId: string): Promise<InterviewSession[]> {
    return await this.sessionRepo.find({
      where: { mentor: { id: mentorId } },
      relations: ['interviewSlots', 'technologies'],
    });
  }

  async delete(id: string) {
    return await this.sessionRepo.delete(id);
  }
}
