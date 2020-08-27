import { HttpModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { UserRepository } from "../user/repositories/user.repository";
import { Controllers } from "./controllers";
import { AssessmentEvent } from "./entities/assessment-event.entity";
import { AssessmentScoreChangedHandler } from "./events/assessment/assessment-score-changed.event";
import { AssignmentCreatedNotificationHandler } from "./events/assignment/assignment-created.event";
import { AssignmentStateChangedNotificationHandler } from "./events/assignment/assignment-state-changed.event";
import { GroupRegisteredNotificationHandler } from "./events/assignment/group-registered.event";
import { GroupUnregisteredNotificationHandler } from "./events/assignment/group-unregistered.event";
import { UserRegisteredNotificationHandler } from "./events/assignment/user-registered.event";
import { UserUnregisteredNotificationHandler } from "./events/assignment/user-unregistered.event";
import { UserJoinedGroupHandler } from "./events/group/user-joined-group.event";
import { UserLeftGroupHandler, UserLeftGroupNotificationHandler } from "./events/group/user-left-group.event";
import { Guards } from "./guards";
import { QueryHandlers } from "./queries";
import { Repositories } from "./repositories";
import { Services } from "./services";
import { GroupRegistrationRelation } from "./entities/group-registration-relation.entity";
import { CourseMemberGuard } from "./guards/course-member.guard";
import { TeachingStaffGuard } from "./guards/teaching-staff.guard";
import { CourseParticipantsService } from "./services/course-participants.service";
import { AssignmentService } from "./services/assignment.service";
import { IdentityGuard } from "./guards/identity.guard";
import { CourseJoinedHandler } from "./events/participant/course-joined.event";

@Module({
	imports: [
		TypeOrmModule.forFeature([...Repositories, UserRepository, AssessmentEvent, GroupRegistrationRelation]),
		CqrsModule,
		HttpModule,
		AuthModule
	],
	controllers: [...Controllers],
	providers: [
		...Services,
		...Guards,
		...[
			CourseJoinedHandler,
			UserJoinedGroupHandler, 
			UserLeftGroupHandler, 
			AssessmentScoreChangedHandler,
		],
		...[
			UserLeftGroupNotificationHandler,
			AssignmentCreatedNotificationHandler,
			AssignmentStateChangedNotificationHandler,
			GroupRegisteredNotificationHandler,
			GroupUnregisteredNotificationHandler,
			UserRegisteredNotificationHandler,
			UserUnregisteredNotificationHandler
		],
		...QueryHandlers
	],
	exports: [TypeOrmModule, CourseMemberGuard, TeachingStaffGuard, IdentityGuard, CourseParticipantsService, AssignmentService]
})
export class CourseModule { }
