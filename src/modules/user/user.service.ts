import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindManyOptions, DataSource, Repository } from 'typeorm';
import { hashPasswordHelper } from 'src/helpers/util';
import aqp from 'api-query-params';
import { Mentor } from './entities/mentor.entity';
import { Candidate } from './entities/candidate.entity';
import { Technology } from '../technology/technology.entity';
import { Major } from '../major/major.entity';
import { Level } from '../level/level.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Major) private majorRepo: Repository<Major>,
    private dataSource: DataSource,
    @InjectRepository(Level) private levelRepo: Repository<Level>,
    @InjectRepository(Technology) private techRepo: Repository<Technology>,
  ) {}

  async isEmailExist(email: string): Promise<boolean> {
    const user = await this.userRepository.findOneBy({ email });
    return !!user;
  }

  //create user
  async create(CreateUserDto: Partial<User>): Promise<User> {
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
  async findAll(): Promise<User[] | Candidate[] | Mentor[]> {
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
    const options: FindManyOptions<User | Mentor | Candidate> = {
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

  // user.service.ts
  async findOne(id: string): Promise<User | Mentor | Candidate> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['majors', 'levels', 'technologies'],
    });
    if (!user) {
      throw new BadRequestException(`Không tìm thấy người dùng với id ${id}`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['majors', 'levels', 'technologies'],
    });
    if (!user)
      throw new BadRequestException(
        `Không tìm thấy người dùng với email ${email}`,
      );
    return user;
  }

  //update user
  async update(
    id: string,
    dto: Partial<User> & {
      majorIds?: string[];
      levelIds?: string[];
      technologyIds?: string[];
    },
  ): Promise<User> {
    // tách các mảng ID ra
    const { majorIds, levelIds, technologyIds, ...rest } = dto;

    // tạo object partial để save
    const toSave: any = { id, ...rest };

    if (majorIds) {
      // mảng stub Major chỉ với id
      toSave.majors = majorIds.map((mId) => ({ id: mId }));
    }
    if (levelIds) {
      toSave.levels = levelIds.map((lId) => ({ id: lId }));
    }
    if (technologyIds) {
      toSave.technologies = technologyIds.map((tId) => ({ id: tId }));
    }

    // lưu (TypeORM sẽ tự xoá/insert vào user_majors, user_levels, user_technologies)
    await this.userRepository.save(toSave);
    this.updateUserCount();
    return this.userRepository.findOneOrFail({
      where: { id },
      relations: ['majors', 'levels', 'technologies'],
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    const result = await this.userRepository.delete(user.id);
    if (result.affected === 0) throw new Error(`User with ID ${id} not found`);
  }

  async updateUserCount() {
    await this.majorRepo
      .createQueryBuilder()
      .update()
      .set({
        user_count: () => `
    (
      SELECT COUNT(*)
      FROM user_majors um
      WHERE um."majorId" = id   
    )
  `,
      })
      .execute();

    await this.levelRepo
      .createQueryBuilder() // 1) bind Major entity với alias là "m"
      .update() // 2) khởi tạo UpdateQueryBuilder trên entity đã bind
      .set({
        user_count: () => `
      (
        SELECT COUNT(*)
        FROM user_levels um
        WHERE um."levelId" = id
      )
    `,
      })
      .execute();

    await this.techRepo
      .createQueryBuilder() // 1) bind Major entity với alias là "m"
      .update() // 2) khởi tạo UpdateQueryBuilder trên entity đã bind
      .set({
        user_count: () => `
      (
        SELECT COUNT(*)
        FROM user_technologies um
        WHERE um."technologyId" = id
      )
    `,
      })
      .execute();
  }
}
