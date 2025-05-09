import { GetUser, Public } from 'src/decorator/customize';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateMentorDto } from './dto/update-mentor-dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Mentor } from './entities/mentor.entity';
import { User } from './entities/user.entity';
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
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body() createUserDto: Partial<User>) {
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

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile')
  async update(
    @GetUser('id') userId: string,
    @Body() updateUserDto: Partial<User>,
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
