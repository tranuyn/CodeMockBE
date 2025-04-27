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
import { Major } from './major.entity';
import { MajorService } from './major.service';
import { Public } from 'src/decorator/customize';

@Controller('major')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @Public()
  @Post('create')
  async create(@Body() createDto: Partial<Major>) {
    return await this.majorService.create(createDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.majorService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.majorService.findOne(id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<Major>) {
    return this.majorService.update(id, updateDto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.majorService.remove(id);
  }
}
