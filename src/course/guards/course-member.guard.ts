import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { UserDto } from "../../shared/dto/user.dto";
import { CourseId } from "../entities/course.entity";
import { NotACourseMemberException } from "../exceptions/custom-exceptions";
import { CourseParticipantsService } from "../services/course-participants.service";

/**
 * Only allows requests for users, that are members of the course.
 * Assumes that request body has requesting `user` attached to it (done by `AuthGuard`).
 * Attaches `participant` to the request to allow following guards or controllers to access
 * information about this participant (i.e. `role`).
 * 
 * @throws `NotACourseMemberException`
 */
@Injectable()
export class CourseMemberGuard implements CanActivate {
	
	constructor(private courseParticipants: CourseParticipantsService) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {	
		const request = context.switchToHttp().getRequest();
		const user: UserDto = request.user;
		const courseId: CourseId = request.params.courseId;

		try {
			const participant = await this.courseParticipants.getParticipant(courseId, user.id);
			// User is participant -> Attach to request, so controller can use information (i.e. role)
			request.participant = participant;
			return true;
		} catch(error) {
			if (error instanceof EntityNotFoundError) {
				throw new NotACourseMemberException(courseId, user.id);
			}
		}

		return false;
	}

}
