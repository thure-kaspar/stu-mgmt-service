import { Module } from "@nestjs/common";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRepository } from "./repositories/user.repository";
import { GroupRepository } from "../course/database/repositories/group.repository";
import { AssessmentRepository } from "../course/database/repositories/assessment.repository";
import { AssignmentRepository } from "../course/database/repositories/assignment.repository";
import { GroupEventRepository } from "../course/database/repositories/group-event.repository";

@Module({
	imports: [TypeOrmModule.forFeature([UserRepository, GroupRepository, GroupEventRepository, AssignmentRepository, AssessmentRepository])],
	controllers: [UserController],
	providers: [UserService]
})
export class UserModule {}
