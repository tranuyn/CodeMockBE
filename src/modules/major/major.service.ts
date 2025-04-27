import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Major } from './major.entity';

@Injectable()
export class MajorService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  private async isNameExist(name: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('major')
      .select('*', { count: 'exact', head: true })
      .eq('name', name);
    if (error) throw new BadRequestException(error.message);
    return (count ?? 0) > 0;
  }

  async create(dto: Partial<Major>): Promise<Major> {
    const { name } = dto;
    if (!name) throw new BadRequestException('Name là bắt buộc.');
    if (await this.isNameExist(name)) {
      throw new BadRequestException(
        `Tên "${name}" đã tồn tại. Vui lòng dùng tên khác.`,
      );
    }

    const { data, error } = await this.supabase
      .from('major')
      .insert({ name })
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findAll(): Promise<Major[]> {
    const { data, error } = await this.supabase
      .from('major')
      .select('*, users(*)');
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async findOne(id: string): Promise<Major> {
    const { data, error } = await this.supabase
      .from('major')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: Partial<Major>): Promise<Major> {
    const { name } = dto;
    if (name && (await this.isNameExist(name))) {
      throw new BadRequestException(
        `Tên "${name}" đã tồn tại. Vui lòng dùng tên khác.`,
      );
    }

    const { data, error } = await this.supabase
      .from('major')
      .update({ name })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.from('major').delete().eq('id', id);
    if (error) throw new BadRequestException(error.message);
  }
}
