// src/supabase/supabase.module.ts
import { Module, Global } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('SUPABASE_URL');
        const key =
          config.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
          config.get<string>('SUPABASE_ANON_KEY');
        return createClient(url, key);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class SupabaseModule {}
