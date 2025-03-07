import { CreateUserDto } from './dto/create-user-dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //create user
  async create(CreateUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(CreateUserDto);
    return await this.userRepository.save(newUser);
  }

  //get all users
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  //get user by id
  async findOne(id: number): Promise<User | undefined> {
    return await this.userRepository.findOneBy({ id });
  }

  //update user
  async update(
    id: number,
    updateUserDto: CreateUserDto,
  ): Promise<User | undefined> {
    const user = await this.findOne(id);
    if (!user) return undefined;

    // Cập nhật các thuộc tính của user
    Object.assign(user, updateUserDto);

    // Lưu người dùng đã cập nhật vào cơ sở dữ liệu
    return await this.userRepository.save(user);
  }

  //delete user
  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) throw new Error(`User with ID ${id} not found`);
  }
}
