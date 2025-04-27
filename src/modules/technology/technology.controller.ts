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
import { Technology } from './technology.entity';
import { TechnologyService } from './technology.service';
import { Public } from 'src/decorator/customize';

@Controller('technology')
export class TechnologyController {
  constructor(private readonly technologyService: TechnologyService) {}

  @Public()
  @Post('create')
  async create(@Body() createDto: Partial<Technology>) {
    return await this.technologyService.create(createDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.technologyService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.technologyService.findOne(id);
  }

  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: Partial<Technology>) {
    return this.technologyService.update(id, updateDto);
  }

  @Public()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.technologyService.remove(id);
  }
}
