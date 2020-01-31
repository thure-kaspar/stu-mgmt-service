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
import { AssignmentService } from './services/assignment.service';
import { AssignmentRepository } from "./repositories/assignment.repository";
import { AssessmentService } from "./services/assessment.service";
import { AssessmentRepository } from "./repositories/assessment.repository";
import { AssessmentUserRelationRepository } from "./repositories/assessment-user-relation.repository";

@Module({
  imports: [TypeOrmModule.forFeature([
    CourseRepository, 
    UserRepository, 
    CourseUserRelationRepository, 
    GroupRepository, 
    AssignmentRepository, 
    AssessmentRepository,
    AssessmentUserRelationRepository
  ])],
  controllers: [CourseController, GroupController],
  providers: [CourseService, GroupService, AssignmentService, AssessmentService]
})
export class CourseModule {}
