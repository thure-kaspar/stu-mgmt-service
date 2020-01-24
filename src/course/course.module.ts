import { Module } from '@nestjs/common';
import { CourseController } from './controllers/course.controller';
import { CourseService } from './services/course.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseRepository } from './repositories/course.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { CourseUserRelationRepository } from './repositories/course-user-relation.repository';
import { GroupService } from './services/group.service';
import { GroupRepository } from './repositories/group.repository';
import { GroupController } from './controllers/group.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CourseRepository, UserRepository, CourseUserRelationRepository, GroupRepository])],
  controllers: [CourseController, GroupController],
  providers: [CourseService, GroupService]
})
export class CourseModule {}
