import { Level } from './level.entity';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class LevelService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async isNameExist(name: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('levels')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    return !!data;
  }

  // Create
  async create(createDto: Partial<Level>): Promise<Level> {
    const isExist = await this.isNameExist(createDto.name);
    if (isExist) {
      throw new BadRequestException(
        `Tên ${createDto.name} đã tồn tại. Vui lòng sử dụng tên khác`,
      );
    }

    const { data, error } = await this.supabase
      .from('levels')
      .insert(createDto)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data as Level;
  }

  // Get all
  async findAll(): Promise<Level[]> {
    const { data, error } = await this.supabase.from('levels').select(`
        *,
        users:user_levels(
          user_id(*)
        )
      `);

    if (error) throw new BadRequestException(error.message);
    return data as Level[];
  }

  // Get level by id
  async findOne(id: string): Promise<Level> {
    const { data, error } = await this.supabase
      .from('levels')
      .select(
        `
        *,
        users:user_levels(
          user_id(*)
        )
      `,
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new BadRequestException(`Không tìm thấy cấp bậc với id ${id}`);
    }
    return data as Level;
  }

  // Update level
  async update(id: string, updateDto: Partial<Level>): Promise<Level> {
    const level = await this.findOne(id);
    if (!level) {
      throw new BadRequestException('Không tìm thấy cấp bậc.');
    }

    // If we're updating the name, check if it exists
    if (updateDto.name && updateDto.name !== level.name) {
      const isExist = await this.isNameExist(updateDto.name);
      if (isExist) {
        throw new BadRequestException(
          `Tên ${updateDto.name} đã tồn tại. Vui lòng sử dụng tên khác`,
        );
      }
    }

    const { data, error } = await this.supabase
      .from('levels')
      .update({
        ...updateDto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data as Level;
  }

  // Delete level
  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.from('levels').delete().eq('id', id);

    if (error) {
      throw new BadRequestException(
        `Level with ID ${id} not found or could not be deleted`,
      );
    }
  }

  // Update user count
  async updateUserCount(id: string): Promise<void> {
    // Get the count of users for this level
    const { count, error: countError } = await this.supabase
      .from('user_levels')
      .select('*', { count: 'exact', head: true })
      .eq('level_id', id);

    if (countError) throw new BadRequestException(countError.message);

    // Update the user_count field
    const { error: updateError } = await this.supabase
      .from('levels')
      .update({ user_count: count || 0 })
      .eq('id', id);

    if (updateError) throw new BadRequestException(updateError.message);
  }
}
