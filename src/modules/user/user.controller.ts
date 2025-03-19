import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    await this.userService.create(createUserDto);
    return { message: 'User created successfully' };
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // vd: http://localhost:3000/user/query?status=sent&timestamp=>2016-01-01&authorFirstName=john&limit=10&skip=0&sort=-timestamp
  // status: Trạng thái người dùng (ví dụ: sent).
  // authorFirstName: Điều kiện lọc theo tên tác giả (ví dụ: john).
  // limit: Số lượng người dùng tối đa muốn lấy về (mặc định 10).
  // skip: Số lượng người dùng sẽ bỏ qua (sử dụng để phân trang).
  // sort: Cách sắp xếp kết quả, ví dụ sort=-timestamp để sắp xếp theo thứ tự giảm dần.
  @Get('query')
  findByQuery(@Query() query: any) {
    return this.userService.findByQuery(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
