import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Level } from './level.entity';
import { LevelService } from './level.service';
import { Public } from 'src/decorator/customize';

@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Public()
  @Post('create')
  async create(@Body() createDto: Partial<Level>) {
    return await this.levelService.create(createDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.levelService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.levelService.findOne(id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<Level>) {
    return this.levelService.update(id, updateDto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.levelService.remove(id);
  }
}
