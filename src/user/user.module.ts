import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { AssignmentRegistrationRepository } from "../course/repositories/assignment-registration.repository";
import { AssignmentRepository } from "../course/repositories/assignment.repository";
import { GroupEventRepository } from "../course/repositories/group-event.repository";
import { GroupRepository } from "../course/repositories/group.repository";
import { UserController } from "./controllers/user.controller";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";
import { IdentityGuard } from "./guards/identity.guard";
import { CourseModule } from "../course/course.module";
import { AssessmentRepository } from "../assessment/repositories/assessment.repository";
import { UserSettingsController } from "./controllers/user-settings.controller";
import { UserSettings } from "./entities/user-settings.entity";
import { UserSettingsService } from "./services/user-settings.service";
import { User } from "src/shared/entities/user.entity";
import { UserSettingsRepository } from "./repositories/user-settings.repository";
import { Assessment } from "src/assessment/entities/assessment.entity";
import { AssignmentRegistration } from "src/course/entities/assignment-group-registration.entity";
import { Assignment } from "src/course/entities/assignment.entity";
import { Group } from "src/course/entities/group.entity";
import { GroupEvent } from "src/course/entities/group-event.entity";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			UserRepository,
			UserSettings,
			GroupRepository,
			GroupEventRepository,
			Group,
			GroupEvent,
			AssignmentRepository,
			AssignmentRegistrationRepository,
			AssessmentRepository,
			User,
			Assessment,
			AssignmentRegistration,
			Assignment
		]),
		AuthModule,
		CourseModule
	],
	controllers: [UserController, UserSettingsController],
	providers: [UserService, UserSettingsService, IdentityGuard, UserRepository, UserSettingsRepository, 
		AssessmentRepository, AssignmentRegistrationRepository, AssignmentRepository, GroupRepository, GroupEventRepository]
})
export class UserModule {}
