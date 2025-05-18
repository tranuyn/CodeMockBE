import { Role } from 'src/decorator/customize';
import { Expose } from 'class-transformer';
export class UserResultDto {
  @Expose() id: string;
  @Expose() username: string;
  @Expose() email: string;
  @Expose() role: Role;
  @Expose() avatar: string;
}
