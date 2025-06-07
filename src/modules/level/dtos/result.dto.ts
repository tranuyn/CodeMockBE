// level-result.dto.ts
import { Expose } from 'class-transformer';

export class LevelResultDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() user_count: number;
}
