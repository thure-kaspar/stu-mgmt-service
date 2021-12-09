import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AssessmentRepository } from "../assessment/repositories/assessment.repository";
import { AuthModule } from "../auth/auth.module";
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

@Module({
	imports: [
		TypeOrmModule.forFeature([
			...Repositories,
			UserRepository,
			GroupRegistrationRelation,
			AssessmentRepository
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
		CloseEmptyGroupsHandler
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
