import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './repositories/user.repository';
import { GroupRepository } from "../course/database/repositories/group.repository";
import { AssessmentRepository } from '../course/database/repositories/assessment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository, GroupRepository, AssessmentRepository])],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
