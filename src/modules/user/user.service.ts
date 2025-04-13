import { CreateUserDto } from './dto/create-user-dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { hashPasswordHelper } from 'src/helpers/util';
import aqp from 'api-query-params';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async isEmailExist(email: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ email });
    return !!user;
  }

  //create user
  async create(CreateUserDto: CreateUserDto): Promise<User> {
    const isExist = await this.isEmailExist(CreateUserDto.email);
    if (isExist)
      throw new BadRequestException(
        `Email ${CreateUserDto.email} đã tồn tại. Vui lòng sử dụng email khác`,
      );
    const hashPassword = await hashPasswordHelper(CreateUserDto.password);
    const newUser = this.userRepository.create({
      ...CreateUserDto,
      password: hashPassword,
    });
    return await this.userRepository.save(newUser);
  }

  //get all users
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findByQuery(query: any) {
    const { filter, limit, skip, sort } = aqp(query);
    // const query = aqp(
    //   'status=sent&timestamp>2016-01-01&author.firstName=/john/i&limit=100&skip=50&sort=-timestamp&populate=logs&fields=id,logs.ip'
    // );
    const totalItems = await this.userRepository.count(filter);
    const totalPages = Math.ceil(totalItems / limit);
    const pageNumber = Math.min(totalPages, Math.ceil(skip / limit));
    const options: FindManyOptions<User> = {
      where: filter,
      take: limit,
      skip: skip,
      order: sort,
    };
    const users = await this.userRepository.find(options);
    const sanitizedUsers = users.map(({ password, ...rest }) => rest);
    return {
      totalItems: totalItems,
      totalPages: totalPages,
      pageNumber: pageNumber,
      users: sanitizedUsers,
    };
  }

  //get user by id
  async findOne(id: string): Promise<User | undefined> {
    const result = await this.userRepository.findOneBy({ id });
    if (!result) {
      throw new BadRequestException(`Không tìm thấy người dùng với id ${id}`);
    }
    return result;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.userRepository.findOneBy({ email });
    if (!result) {
      throw new BadRequestException(
        `Không tìm thấy người dùng với email ${email}`,
      );
    }
    return result;
  }

  //update user
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | undefined> {
    const user = await this.findOne(id);
    if (!user) throw new BadRequestException(`Không tìm thấy người dùng.`);

    // Cập nhật các thuộc tính của user
    Object.assign(user, updateUserDto);

    // Lưu người dùng đã cập nhật vào cơ sở dữ liệu
    return await this.userRepository.save(user);
  }

  //delete user
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    const result = await this.userRepository.delete(user.id);
    if (result.affected === 0) throw new Error(`User with ID ${id} not found`);
  }
}
