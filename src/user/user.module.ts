import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { AssessmentRepository } from "../course/repositories/assessment.repository";
import { AssignmentRegistrationRepository } from "../course/repositories/assignment-registration.repository";
import { AssignmentRepository } from "../course/repositories/assignment.repository";
import { GroupEventRepository } from "../course/repositories/group-event.repository";
import { GroupRepository } from "../course/repositories/group.repository";
import { UserController } from "./controllers/user.controller";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/user.service";
import { IdentityGuard } from "./guards/identity.guard";
import { CourseModule } from "../course/course.module";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			UserRepository,
			GroupRepository,
			GroupEventRepository,
			AssignmentRepository,
			AssignmentRegistrationRepository,
			AssessmentRepository
		]),
		AuthModule,
		CourseModule
	],
	controllers: [UserController],
	providers: [UserService, IdentityGuard]
})
export class UserModule {}
