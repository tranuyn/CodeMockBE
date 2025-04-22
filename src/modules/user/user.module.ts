import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Major } from '../major/major.entity';
import { Technology } from '../technology/technology.entity';
import { Level } from '../level/level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Major, Technology, Level])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
