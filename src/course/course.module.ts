import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Activity } from "../activity/activity.entity";
import { ActivityEventHandler } from "../activity/activity.event";
import { AssessmentRepository } from "../assessment/repositories/assessment.repository";
import { AuthModule } from "../auth/auth.module";
import { Submission } from "../submission/submission.entity";
import { UserRepository } from "../user/repositories/user.repository";
import { JoinRandomGroupHandler } from "./commands/join-random-group.handler";
import { Controllers } from "./controllers";
import { GroupRegistrationRelation } from "./entities/group-registration-relation.entity";
import { UserJoinedGroupHandler } from "./events/group/user-joined-group.event";
import {
	CloseEmptyGroupsHandler,
	UserLeftGroupHandler
} from "./events/group/user-left-group.event";
import { Guards } from "./guards";
import { CourseMemberGuard } from "./guards/course-member/course-member.guard";
import { ParticipantIdentityGuard } from "./guards/identity.guard";
import { TeachingStaffGuard } from "./guards/teaching-staff.guard";
import { QueryHandlers } from "./queries";
import { Repositories } from "./repositories";
import { Services } from "./services";
import { GroupMergeStrategy } from "./services/group-merge-strategy/group-merge.strategy";
import { MergeByActivityStrategy } from "./services/group-merge-strategy/merge-by-activity.strategy";
import { Course } from "./entities/course.entity";
import { CourseRepository } from "./repositories/course.repository";
import { Participant } from "./entities/participant.entity";
import { ParticipantRepository } from "./repositories/participant.repository";
import { Assignment } from "./entities/assignment.entity";
import { AssignmentRepository } from "./repositories/assignment.repository";
import { Group } from "./entities/group.entity";
import { GroupRepository } from "./repositories/group.repository";
import { AdmissionFromPreviousSemester } from "./entities/admission-from-previous-semester.entity";
import { AdmissionFromPreviousSemesterRepository } from "./repositories/admission-from-previous-semester.repository";
import { CourseConfig } from "./entities/course-config.entity";
import { CourseConfigRepository } from "./repositories/course-config.repository";
import { GroupSettings } from "./entities/group-settings.entity";
import { GroupSettingsRepository } from "./repositories/group-settings.repository";
import { Assessment } from "src/assessment/entities/assessment.entity";
import { AdmissionCriteria } from "./entities/admission-criteria.entity";
import { AdmissionCriteriaRepository } from "./repositories/admission-criteria.repository";
import { GroupEvent } from "./entities/group-event.entity";
import { GroupEventRepository } from "./repositories/group-event.repository";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			...Repositories,
			UserRepository,
			GroupRegistrationRelation,
			AssessmentRepository,
			Activity,
			Submission,
			Course,
			CourseConfig,
			Participant,
			Assignment,
			Group,
			GroupSettings,
			GroupEvent,
			AdmissionFromPreviousSemester,
			Assessment,
			AdmissionCriteria
		]),
		CqrsModule,
		HttpModule,
		AuthModule
	],
	controllers: [...Controllers],
	providers: [
		...Services,
		...Guards,
		...QueryHandlers,
		JoinRandomGroupHandler,
		UserJoinedGroupHandler,
		UserLeftGroupHandler,
		CloseEmptyGroupsHandler,
		ActivityEventHandler,
		CourseRepository,
		CourseConfigRepository,
		ParticipantRepository,
		AssignmentRepository,
		GroupRepository,
		GroupSettingsRepository,
		GroupEventRepository,
		AdmissionFromPreviousSemesterRepository,
		AdmissionCriteriaRepository,
		AssessmentRepository,
		{ provide: GroupMergeStrategy, useClass: MergeByActivityStrategy }
	],
	exports: [
		TypeOrmModule,
		CourseMemberGuard,
		TeachingStaffGuard,
		ParticipantIdentityGuard,
		...Services
	]
})
export class CourseModule {}
