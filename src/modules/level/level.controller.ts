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

  // vd: http://localhost:3000/user/query?status=sent&timestamp=>2016-01-01&authorFirstName=john&limit=10&skip=0&sort=-timestamp
  // status: Trạng thái người dùng (ví dụ: sent).
  // authorFirstName: Điều kiện lọc theo tên tác giả (ví dụ: john).
  // limit: Số lượng người dùng tối đa muốn lấy về (mặc định 10).
  // skip: Số lượng người dùng sẽ bỏ qua (sử dụng để phân trang).
  // sort: Cách sắp xếp kết quả, ví dụ sort=-timestamp để sắp xếp theo thứ tự giảm dần.
  @Public()
  @Get('query')
  findByQuery(@Query() query: any) {
    return this.levelService.findByQuery(query);
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
