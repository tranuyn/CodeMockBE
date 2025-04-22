import { Level } from './level.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import aqp from 'api-query-params';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(Level)
    private readonly repository: Repository<Level>,
  ) {}

  async isNameExist(name: string): Promise<boolean> {
    const major = await this.repository.findOne({ where: { name } });
    return !!major;
  }

  //create
  async create(createDto: Partial<Level>): Promise<Level> {
    const isExist = await this.isNameExist(createDto.name);
    if (isExist)
      throw new BadRequestException(
        `Tên ${createDto.name} đã tồn tại. Vui lòng sử dụng tên khác`,
      );
    const newLevel = this.repository.create(createDto);
    const saved = await this.repository.save(newLevel);
    return saved;
  }

  //get all
  async findAll(): Promise<Level[]> {
    return this.repository.find({
      relations: ['users'],
    });
  }

  async findByQuery(query: any) {
    const { filter, limit, skip, sort } = aqp(query);
    // const query = aqp(
    //   'status=sent&timestamp>2016-01-01&author.firstName=/john/i&limit=100&skip=50&sort=-timestamp&populate=logs&fields=id,logs.ip'
    // );
    const totalItems = await this.repository.count(filter);
    const totalPages = Math.ceil(totalItems / limit);
    const pageNumber = Math.min(totalPages, Math.ceil(skip / limit));
    const options: FindManyOptions<Level> = {
      where: filter,
      take: limit,
      skip: skip,
      order: sort,
    };
    const levels = await this.repository.find(options);
    return {
      totalItems: totalItems,
      totalPages: totalPages,
      pageNumber: pageNumber,
      levels: levels,
    };
  }

  //get major by id
  async findOne(id: string): Promise<Level> {
    const result = await this.repository.findOne({ where: { id } });
    if (!result) {
      throw new BadRequestException(`Không tìm thấy cấp bậc với id ${id}`);
    }
    return result;
  }

  //update major
  async update(id: string, updateDto: Partial<Level>): Promise<Level> {
    const major = await this.findOne(id);
    if (!major) throw new BadRequestException(`Không tìm thấy chuyên ngành.`);
    return await this.repository.save(major);
  }

  //delete
  async remove(id: string): Promise<void> {
    const major = await this.findOne(id);
    const result = await this.repository.delete(major.id);
    if (result.affected === 0) throw new Error(`Level with ID ${id} not found`);
  }
}
