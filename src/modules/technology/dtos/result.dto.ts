import { Expose } from 'class-transformer';
export class TechnologyResultDto {
  @Expose() id: string;
  @Expose() name: string;
}
