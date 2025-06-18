import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { Rating } from './rating.entity';
import { Public } from 'src/decorator/customize';

@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Public()
  @Post('create')
  create(@Body() data: Partial<Rating>): Promise<Rating> {
    return this.ratingService.create(data);
  }

  @Public()
  @Get()
  findAll(): Promise<Rating[]> {
    return this.ratingService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Rating> {
    return this.ratingService.findOne(id);
  }

  // GET /ratings/mentor/:mentorId
  @Get('mentor/:mentorId')
  async getByMentor(@Param('mentorId') mentorId: string): Promise<Rating[]> {
    return this.ratingService.findByMentorId(mentorId);
  }

  // GET /ratings/candidate/:candidateId
  @Get('candidate/:candidateId')
  async getByCandidate(
    @Param('candidateId') candidateId: string,
  ): Promise<Rating[]> {
    return this.ratingService.findByCandidateId(candidateId);
  }

  @Public()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<Rating>,
  ): Promise<Rating> {
    return this.ratingService.update(id, data);
  }

  @Public()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.ratingService.remove(id);
  }
}
