import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import {
  FindManyOptions,
  DataSource,
  Repository,
  EntityManager,
} from 'typeorm';
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
  async create(createUserDto: Partial<User>): Promise<User> {
    const isExist = await this.isEmailExist(createUserDto.email);
    if (isExist) {
      throw new BadRequestException(
        `Email ${createUserDto.email} đã tồn tại. Vui lòng sử dụng email khác`,
      );
    }

    const hashPassword = await hashPasswordHelper(createUserDto.password);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashPassword,
    });

    const savedUser = await this.userRepository.save(newUser);
    return savedUser;
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
    const options: FindManyOptions<User> = {
      where: filter,
      take: limit,
      skip: skip,
      order: sort,
    };
    const users = await this.userRepository.find(options);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    return this.dataSource.transaction(async (manager) => {
      // Đầu tiên lấy user hiện tại
      const existingUser = await manager.findOne(User, {
        where: { id },
        relations: ['majors', 'levels', 'technologies'],
      });

      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Cập nhật thông tin cơ bản của user
      const { majorIds, levelIds, technologyIds, ...rest } = dto;

      // Merge thuộc tính cơ bản
      Object.assign(existingUser, rest);

      // Lưu thông tin cơ bản của user trước
      await manager.save(existingUser);

      // Xử lý majors nếu được cung cấp
      if (majorIds !== undefined) {
        await this.updateRelationships(
          manager,
          'user_major',
          'major_id',
          id,
          majorIds,
        );
      }

      // Xử lý levels nếu được cung cấp
      if (levelIds !== undefined) {
        await this.updateRelationships(
          manager,
          'user_level',
          'level_id',
          id,
          levelIds,
        );
      }

      // Xử lý technologies nếu được cung cấp
      if (technologyIds !== undefined) {
        await this.updateRelationships(
          manager,
          'user_technology',
          'technology_id',
          id,
          technologyIds,
        );
      }

      this.updateUserCount();

      // Trả về user đã cập nhật với tất cả các quan hệ
      return manager.findOneOrFail(User, {
        where: { id },
        relations: ['majors', 'levels', 'technologies'],
      });
    });
  }

  // Hàm helper để cập nhật các mối quan hệ
  private async updateRelationships(
    manager: EntityManager,
    tableName: string,
    foreignKeyColumn: string,
    userId: string,
    newIds: string[],
  ): Promise<void> {
    // 1. Lấy danh sách các ID hiện có
    const existingRelations = await manager
      .createQueryBuilder()
      .select(foreignKeyColumn)
      .from(tableName, 'rel')
      .where('user_id = :userId', { userId })
      .getRawMany();

    const existingIds = existingRelations.map((rel) => rel[foreignKeyColumn]);

    // 2. Xác định ID cần thêm và cần xóa
    const idsToAdd = newIds.filter((id) => !existingIds.includes(id));
    const idsToRemove = existingIds.filter((id) => !newIds.includes(id));

    // 3. Xóa các quan hệ cũ
    if (idsToRemove.length > 0) {
      await manager
        .createQueryBuilder()
        .delete()
        .from(tableName)
        .where('user_id = :userId', { userId })
        .andWhere(`${foreignKeyColumn} IN (:...idsToRemove)`, { idsToRemove })
        .execute();
    }

    // 4. Thêm các quan hệ mới
    if (idsToAdd.length > 0) {
      const values = idsToAdd.map((id) => ({
        user_id: userId,
        [foreignKeyColumn]: id,
      }));

      await manager
        .createQueryBuilder()
        .insert()
        .into(tableName)
        .values(values)
        .execute();
    }
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

  async incrementWarningCount(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException(`Không tìm thấy user với ID ${userId}`);
    }

    user.warning_count = (user.warning_count || 0) + 1;

    const MAX_WARNING = 3;

    if (user.warning_count >= MAX_WARNING) {
      const now = new Date();
      const threeMonthsLater = new Date(now.setMonth(now.getMonth() + 3));
      user.warning_until = threeMonthsLater;
    }

    return await this.userRepository.save(user);
  }
}
