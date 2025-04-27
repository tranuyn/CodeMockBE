import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Technology } from './technology.entity';

@Injectable()
export class TechnologyService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async isNameExist(name: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('technology')
      .select('id')
      .ilike('name', name) // sử dụng ilike để tìm kiếm không phân biệt chữ hoa/thường
      .maybeSingle();

    if (error) {
      console.error('Error checking name existence:', error);
      return false; // Nếu có lỗi, coi như không tồn tại để hiển thị lỗi rõ ràng hơn
    }

    return !!data;
  }

  // Tạo mới tag
  async create(createDto: Partial<Technology>): Promise<Technology> {
    const { name } = createDto;
    if (!name) throw new BadRequestException('Name là bắt buộc.');

    try {
      // Kiểm tra tên tồn tại
      const exists = await this.isNameExist(name);
      if (exists) {
        throw new BadRequestException(
          `Tên "${name}" đã tồn tại. Vui lòng dùng tên khác.`,
        );
      }

      // Tạo đối tượng với timestamp
      const newTech = {
        name,
        user_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('technology')
        .insert(newTech)
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new BadRequestException(
          `Không thể tạo technology: ${error.message}`,
        );
      }

      return data;
    } catch (err) {
      console.error('Create technology error:', err);
      throw err instanceof BadRequestException
        ? err
        : new BadRequestException('Không thể tạo technology');
    }
  }

  // Lấy tất cả tags (có thể kèm số user nếu bạn thiết lập relation trong Supabase)
  async findAll(): Promise<Technology[]> {
    const { data, error } = await this.supabase
      .from('technology')
      .select('*, users(*)'); // giả sử bạn đã bật foreign key => users là mảng User
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // Lấy 1 tag theo id
  async findOne(id: string): Promise<Technology> {
    const { data, error } = await this.supabase
      .from('technology')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // Cập nhật tên tag
  async update(
    id: string,
    updateDto: Partial<Technology>,
  ): Promise<Technology> {
    const { name } = updateDto;
    if (name && (await this.isNameExist(name))) {
      throw new BadRequestException(
        `Tên "${name}" đã tồn tại. Vui lòng dùng tên khác.`,
      );
    }

    const { data, error } = await this.supabase
      .from('technology')
      .update({ name })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  // Xóa tag
  async remove(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('technology')
      .delete()
      .eq('id', id);
    if (error) throw new BadRequestException(error.message);
  }
}
