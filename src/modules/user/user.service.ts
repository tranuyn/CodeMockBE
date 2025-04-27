import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { hashPasswordHelper } from 'src/helpers/util';
import aqp from 'api-query-params';
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from './entity/user.entity';

export type SortObject = Record<string, 1 | -1>;

export interface AqpResult {
  filter: Record<string, any>;
  skip: number;
  limit: number;
  sort?: SortObject;
}

@Injectable()
export class UserService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  // 1. Kiểm tra email tồn tại
  async isEmailExist(email: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('email', email)
      .maybeSingle();
    if (error) throw new BadRequestException(error.message);
    return !!data;
  }

  // 2. Tạo user mới
  async create(dto: Partial<User>): Promise<any> {}

  // 3. Lấy tất cả user
  async findAll(): Promise<User[]> {
    const { data, error } = await this.supabase.from('users').select('*');
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // 4. Lấy theo query filter/paging/sort
  async findByQuery(query: any) {
    const { filter, skip, limit, sort } = aqp(query) as AqpResult;
    // đếm tổng
    const { count: totalItems, error: cErr } = await this.supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .match(filter);
    if (cErr) throw new BadRequestException(cErr.message);

    // lấy dữ liệu
    let builder = this.supabase
      .from('users')
      .select('*')
      .match(filter)
      .range(skip, skip + limit - 1);
    if (sort) {
      const [[field, dir]] = Object.entries(sort) as [string, 1 | -1][];
      builder = builder.order(field, { ascending: dir === 1 });
    }
    const { data: users, error } = await builder;
    if (error) throw new BadRequestException(error.message);

    const totalPages = Math.ceil((totalItems || 0) / limit);
    const pageNumber = Math.min(totalPages, Math.ceil(skip / limit) + 1);

    return { totalItems, totalPages, pageNumber, users };
  }

  // 5. Lấy 1 user theo ID
  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*, majors(*), levels(*), technologies(*)')
      .eq('id', id)
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // 6. Lấy 1 user theo email
  async findByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*, majors(*), levels(*), technologies(*)')
      .eq('email', email)
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // 7. Cập nhật user và relation arrays
  async update(
    id: string,
    dto: Partial<User> & {
      majorIds?: string[];
      levelIds?: string[];
      technologyIds?: string[];
    },
  ) {
    const { majorIds, levelIds, technologyIds, password, ...rest } = dto;
    // hash password nếu cần
    const payload: any = { ...rest };
    if (password) {
      payload.password = await hashPasswordHelper(password);
    }
    // mảng relation: Supabase sẽ update through table nếu đã thiết lập FK+RLS đúng
    if (majorIds) payload.majors = majorIds.map((m) => ({ id: m }));
    if (levelIds) payload.levels = levelIds.map((l) => ({ id: l }));
    if (technologyIds)
      payload.technologies = technologyIds.map((t) => ({ id: t }));

    const { data, error } = await this.supabase
      .from('users')
      .update(payload)
      .eq('id', id)
      .select('*, majors(*), levels(*), technologies(*)')
      .single();

    if (error) throw new BadRequestException(error.message);

    // đồng bộ lại user_count bên majors/levels/technologies
    await this.updateUserCount();
    return data;
  }

  // 8. Xóa user
  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.from('users').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
  }

  // 9. Đồng bộ lại user_count các bảng liên quan
  async updateUserCount() {
    // Lấy tất cả majors, levels, technologies
    const tables = [
      { name: 'majors', rel: 'user_majors', key: 'majorId' },
      { name: 'levels', rel: 'user_levels', key: 'levelId' },
      { name: 'technologies', rel: 'user_technologies', key: 'technologyId' },
    ];

    for (const { name, rel, key } of tables) {
      // 1) Lấy danh sách id của bảng chính
      const { data: items, error: iErr } = await this.supabase
        .from(name)
        .select('id');
      if (iErr) throw new BadRequestException(iErr.message);

      // 2) Cho mỗi record, đếm số user liên quan rồi update user_count
      for (const { id } of items!) {
        const { count, error: cErr } = await this.supabase
          .from(rel)
          .select('*', { count: 'exact', head: true })
          .eq(key, id);
        if (cErr) throw new BadRequestException(cErr.message);

        const { error: uErr } = await this.supabase
          .from(name)
          .update({ user_count: count || 0 })
          .eq('id', id);
        if (uErr) throw new BadRequestException(uErr.message);
      }
    }
  }
}
