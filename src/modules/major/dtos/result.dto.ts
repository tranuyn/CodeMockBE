// major-result.dto.ts
import { Expose } from 'class-transformer';

export class MajorResultDto {
  @Expose() id: string;
  @Expose() name: string;
}
