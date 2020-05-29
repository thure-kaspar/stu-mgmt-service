import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserDto } from "../../shared/dto/user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRepository } from "../../user/repositories/user.repository";
import { User } from "../../shared/entities/user.entity";
import { NotACourseMemberException } from "../exceptions/custom-exceptions";

/**
 * Only allows requests for users, that are members of the course.
 */
@Injectable()
export class CourseMemberGuard implements CanActivate {
	
	constructor(@InjectRepository(User) private userRepo: UserRepository) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {	
		const request = context.switchToHttp().getRequest();
		const user: UserDto = request.user;
		const courseId: string = request.params.courseId;

		if (await this.userRepo.isMemberOfCourse(user.id, courseId)) {
			return true;
		}

		throw new NotACourseMemberException();
	}

}
