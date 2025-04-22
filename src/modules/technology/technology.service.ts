import { Technology } from './technology.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import aqp from 'api-query-params';

@Injectable()
export class TechnologyService {
  constructor(
    @InjectRepository(Technology)
    private readonly repository: Repository<Technology>,
  ) {}

  async isNameExist(name: string): Promise<boolean> {
    const major = await this.repository.findOne({ where: { name } });
    return !!major;
  }

  //create
  async create(createDto: Partial<Technology>): Promise<Technology> {
    const isExist = await this.isNameExist(createDto.name);
    if (isExist)
      throw new BadRequestException(
        `Tên ${createDto.name} đã tồn tại. Vui lòng sử dụng tên khác`,
      );
    const newTechnology = this.repository.create(createDto);
    const saved = await this.repository.save(newTechnology);
    return saved;
  }

  //get all
  async findAll(): Promise<Technology[]> {
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
    const options: FindManyOptions<Technology> = {
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
  async findOne(id: string): Promise<Technology> {
    const result = await this.repository.findOne({ where: { id } });
    if (!result) {
      throw new BadRequestException(`Không tìm thấy tag với id ${id}`);
    }
    return result;
  }

  //update major
  async update(
    id: string,
    updateDto: Partial<Technology>,
  ): Promise<Technology> {
    const major = await this.findOne(id);
    if (!major) throw new BadRequestException(`Không tìm thấy tag.`);
    return await this.repository.save(major);
  }

  //delete
  async remove(id: string): Promise<void> {
    const major = await this.findOne(id);
    const result = await this.repository.delete(major.id);
    if (result.affected === 0)
      throw new Error(`Technology with ID ${id} not found`);
  }
}
