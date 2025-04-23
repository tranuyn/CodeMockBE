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

  // vd: http://localhost:3000/user/query?status=sent&timestamp=>2016-01-01&authorFirstName=john&limit=10&skip=0&sort=-timestamp
  // status: Trạng thái người dùng (ví dụ: sent).
  // authorFirstName: Điều kiện lọc theo tên tác giả (ví dụ: john).
  // limit: Số lượng người dùng tối đa muốn lấy về (mặc định 10).
  // skip: Số lượng người dùng sẽ bỏ qua (sử dụng để phân trang).
  // sort: Cách sắp xếp kết quả, ví dụ sort=-timestamp để sắp xếp theo thứ tự giảm dần.
  @Public()
  @Get('query')
  findByQuery(@Query() query: any) {
    return this.technologyService.findByQuery(query);
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
