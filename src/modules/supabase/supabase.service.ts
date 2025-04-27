import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  async getUsers() {
    const { data, error } = await this.supabase.from('users').select('*');
    if (error) throw error;
    return data;
  }

  async insertUser(user: { email: string; name?: string }) {
    const { data, error } = await this.supabase
      .from('users')
      .insert(user)
      .single();
    if (error) throw error;
    return data;
  }

  // bạn có thể thêm các phương thức CRUD / realtime / auth…
}
