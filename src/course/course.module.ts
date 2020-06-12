import { Module, HttpModule } from "@nestjs/common";
import { CourseController } from "./controllers/course.controller";
import { CourseService } from "./services/course.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CourseRepository } from "./repositories/course.repository";
import { UserRepository } from "../user/repositories/user.repository";
import { CourseUserRelationRepository } from "./repositories/course-user-relation.repository";
import { GroupService } from "./services/group.service";
import { GroupRepository } from "./repositories/group.repository";
import { GroupController } from "./controllers/group.controller";
import { AssignmentService } from "./services/assignment.service";
import { AssignmentRepository } from "./repositories/assignment.repository";
import { AssessmentService } from "./services/assessment.service";
import { AssessmentRepository } from "./repositories/assessment.repository";
import { AssessmentUserRelationRepository } from "./repositories/assessment-user-relation.repository";
import { AssessmentController } from "./controllers/assessment.controller";
import { AssignmentController } from "./controllers/assignment.controller";
import { UpdateService } from "./services/update.service";
import { CourseConfigController } from "./controllers/config.controller";
import { CourseConfigService } from "./services/course-config.service";
import { CourseConfigRepository } from "./repositories/course-config.repository";
import { GroupSettingsRepository } from "./repositories/group-settings.repository";
import { AdmissionCriteraRepository } from "./repositories/admission-criteria.repository";
import { AssignmentTemplateRepository } from "./repositories/assignment-template.repository";
import { CqrsModule } from "@nestjs/cqrs";
import { UserJoinedGroupHandler } from "./events/user-joined-group.event";
import { UserLeftGroupHandler, UserLeftGroupNotificationHandler } from "./events/user-left-group.event";
import { GroupEventRepository } from "./repositories/group-event.repository";
import { CanJoinCourseHandler } from "./queries/can-join-course/can-join-course.query";
import { CourseMemberGuard } from "./guards/course-member.guard";
import { AuthModule } from "../auth/auth.module";
import { AssessmentAllocationController } from "./controllers/assessment-allocation.controller";
import { AssessmentAllocationService } from "./services/assessment-allocation.service";
import { AssessmentAllocationRepository } from "./repositories/assessment-allocation.repository";

const EventHandlers = [UserJoinedGroupHandler, UserLeftGroupHandler, UserLeftGroupNotificationHandler];
const QueryHandlers = [CanJoinCourseHandler];
const Guards = [CourseMemberGuard];

@Module({
	imports: [
		TypeOrmModule.forFeature([
			CourseRepository,
			UserRepository,
			CourseUserRelationRepository,
			GroupRepository,
			AssignmentRepository,
			AssessmentRepository,
			AssessmentUserRelationRepository,
			CourseConfigRepository,
			GroupSettingsRepository,
			AdmissionCriteraRepository,
			AssignmentTemplateRepository,
			GroupEventRepository,
			AssessmentAllocationRepository
		]),
		CqrsModule,
		HttpModule,
		AuthModule
	],
	controllers: [AssessmentController, AssignmentController, CourseController, GroupController, CourseConfigController, AssessmentAllocationController],
	providers: [
		CourseService, GroupService, AssignmentService, AssessmentService, UpdateService, CourseConfigService, AssessmentAllocationService,
		...Guards,
		...EventHandlers,
		...QueryHandlers
	]
})
export class CourseModule { }
