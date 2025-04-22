import { Major } from './major.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import aqp from 'api-query-params';

@Injectable()
export class MajorService {
  constructor(
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
  ) {}

  async isNameExist(name: string): Promise<boolean> {
    const major = await this.majorRepository.findOne({ where: { name } });
    return !!major;
  }

  //create
  async create(createDto: Partial<Major>): Promise<Major> {
    const isExist = await this.isNameExist(createDto.name);
    if (isExist)
      throw new BadRequestException(
        `Tên ${createDto.name} đã tồn tại. Vui lòng sử dụng tên khác`,
      );
    const newMajor = this.majorRepository.create(createDto);
    const saved = await this.majorRepository.save(newMajor);
    return saved;
  }

  //get all
  async findAll(): Promise<Major[]> {
    return this.majorRepository.find({
      relations: ['users'],
    });
  }

  async findByQuery(query: any) {
    const { filter, limit, skip, sort } = aqp(query);
    // const query = aqp(
    //   'status=sent&timestamp>2016-01-01&author.firstName=/john/i&limit=100&skip=50&sort=-timestamp&populate=logs&fields=id,logs.ip'
    // );
    const totalItems = await this.majorRepository.count(filter);
    const totalPages = Math.ceil(totalItems / limit);
    const pageNumber = Math.min(totalPages, Math.ceil(skip / limit));
    const options: FindManyOptions<Major> = {
      where: filter,
      take: limit,
      skip: skip,
      order: sort,
    };
    const majors = await this.majorRepository.find(options);
    return {
      totalItems: totalItems,
      totalPages: totalPages,
      pageNumber: pageNumber,
      majors: majors,
    };
  }

  //get major by id
  async findOne(id: string): Promise<Major> {
    const result = await this.majorRepository.findOne({ where: { id } });
    if (!result) {
      throw new BadRequestException(`Không tìm thấy chuyên ngành với id ${id}`);
    }
    return result;
  }

  //update major
  async update(id: string, updateDto: Partial<Major>): Promise<Major> {
    const major = await this.findOne(id);
    if (!major) throw new BadRequestException(`Không tìm thấy chuyên ngành.`);
    return await this.majorRepository.save(major);
  }

  //delete
  async remove(id: string): Promise<void> {
    const major = await this.findOne(id);
    const result = await this.majorRepository.delete(major.id);
    if (result.affected === 0) throw new Error(`Major with ID ${id} not found`);
  }
}
