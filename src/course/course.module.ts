import { HttpModule, Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { UserRepository } from "../user/repositories/user.repository";
import { Controllers } from "./controllers";
import { AssessmentEvent } from "./entities/assessment-event.entity";
import { GroupRegistrationRelation } from "./entities/group-registration-relation.entity";
//import { EventHandlers } from "./events";
import { Guards } from "./guards";
import { CourseMemberGuard } from "./guards/course-member.guard";
import { ParticipantIdentityGuard } from "./guards/identity.guard";
import { TeachingStaffGuard } from "./guards/teaching-staff.guard";
import { QueryHandlers } from "./queries";
import { Repositories } from "./repositories";
import { Services } from "./services";
import { UserJoinedGroupHandler, UserJoinedGroupNotificationHandler } from "./events/group/user-joined-group.event";
import { UserLeftGroupHandler, UserLeftGroupNotificationHandler } from "./events/group/user-left-group.event";
import { AssessmentScoreChangedHandler } from "./events/assessment/assessment-score-changed.event";
import { AssignmentCreatedNotificationHandler } from "./events/assignment/assignment-created.event";
import { AssignmentStateChangedNotificationHandler } from "./events/assignment/assignment-state-changed.event";
import { GroupRegisteredNotificationHandler } from "./events/assignment/group-registered.event";
import { GroupUnregisteredNotificationHandler } from "./events/assignment/group-unregistered.event";
import { UserRegisteredNotificationHandler } from "./events/assignment/user-registered.event";
import { UserUnregisteredNotificationHandler } from "./events/assignment/user-unregistered.event";
import { CourseJoinedHandler_AutomaticGroupJoin } from "./events/participant/automatic-group-join.handler";
import { RegistrationsCreatedNotificationHandler } from "./events/assignment/registrations-created.event";
import { RegistrationsRemovedNotificationHandler } from "./events/assignment/registrations-removed.event";
import { AssignmentRemovedNotificationHandler } from "./events/assignment/assignment-removed.event";
import { CourseJoinedNotificationHandler } from "./events/participant/course-joined.event";

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
		...QueryHandlers,
		// EventHandlers that are used internally:
		CourseJoinedHandler_AutomaticGroupJoin,
		UserJoinedGroupHandler, 
		UserLeftGroupHandler, 
		AssessmentScoreChangedHandler,
		
		// EventHandlers that publish events to other systems:
		CourseJoinedNotificationHandler,
		UserJoinedGroupNotificationHandler,
		UserLeftGroupNotificationHandler,
		AssignmentCreatedNotificationHandler,
		AssignmentRemovedNotificationHandler,
		AssignmentStateChangedNotificationHandler,
		GroupRegisteredNotificationHandler,
		GroupUnregisteredNotificationHandler,
		UserRegisteredNotificationHandler,
		UserUnregisteredNotificationHandler,
		RegistrationsCreatedNotificationHandler,
		RegistrationsRemovedNotificationHandler
	],
	exports: [TypeOrmModule, CourseMemberGuard, TeachingStaffGuard, ParticipantIdentityGuard, ...Services]
})
export class CourseModule { }
