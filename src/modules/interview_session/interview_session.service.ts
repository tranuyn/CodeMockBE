import { Injectable } from '@nestjs/common';
import {
  CreateInterviewSessionDto,
  UpdateInterviewSessionDto,
} from './dtos/request.dto';

@Injectable()
export class InterviewSessionService {
  private sessions = [];

  create(dto: CreateInterviewSessionDto) {
    const newSession = {
      sessionId: Date.now(),
      createAt: new Date(),
      ...dto,
    };
    this.sessions.push(newSession);
    return newSession;
  }

  update(id: number, dto: UpdateInterviewSessionDto) {
    const index = this.sessions.findIndex((s) => s.sessionId === id);
    if (index === -1) return null;

    this.sessions[index] = { ...this.sessions[index], ...dto };
    return this.sessions[index];
  }

  findByScheduleId(scheduleId: number) {
    return this.sessions.filter((session) => session.scheduleId === scheduleId);
  }
}
