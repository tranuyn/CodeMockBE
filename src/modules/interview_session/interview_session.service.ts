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
      createdAt: new Date(),
      updatedAt: new Date(),
      ...dto,
    };
    this.sessions.push(newSession);
    return newSession;
  }

  update(id: number, dto: UpdateInterviewSessionDto) {
    const index = this.sessions.findIndex((s) => s.sessionId === id);
    if (index === -1) return null;

    const updatedSession = {
      ...this.sessions[index],
      ...dto,
      updatedAt: new Date(), // mỗi lần update thì cập nhật updatedAt
    };

    this.sessions[index] = updatedSession;
    return updatedSession;
  }

  findById(id: number) {
    return this.sessions.find((session) => session.sessionId === id) || null;
  }

  findByScheduleId(scheduleId: number) {
    return this.sessions.filter((session) => session.scheduleId === scheduleId);
  }

  delete(id: number) {
    const index = this.sessions.findIndex((s) => s.sessionId === id);
    if (index === -1) return null;

    const deletedSession = this.sessions.splice(index, 1);
    return deletedSession[0];
  }
}
