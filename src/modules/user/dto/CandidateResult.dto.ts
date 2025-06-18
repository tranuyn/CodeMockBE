import { Expose } from 'class-transformer';
import { ROLE } from 'src/common/enums/role.enum';
export class UserResultDto {
  @Expose() id: string;
  @Expose() username: string;
  @Expose() email: string;
  @Expose() role: ROLE;
  @Expose() avatarUrl: string;
}
