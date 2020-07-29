import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserDto } from "../../shared/dto/user.dto";
import { CourseRole } from "../../shared/enums";
import { CourseParticipantsService } from "../services/course-participants.service";
import { NotATeachingStaffMember } from "../exceptions/custom-exceptions";

/**
 * Only allows requests for users, that are either `LECTURER` or `TUTOR`. // TODO: Include tools ?
 * Assumes that `request` has `participant` property (attached by `CourseMemberGuard`). 
 * 
 * @return `false`, if participant does not have the required roles.
 */
@Injectable()
export class TeachingStaffGuard implements CanActivate {
	
	constructor(private courseParticipants: CourseParticipantsService) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {	
		const request = context.switchToHttp().getRequest();
		const participant: UserDto = request.participant;

		if (participant?.courseRole === CourseRole.LECTURER || participant?.courseRole === CourseRole.TUTOR) {
			return true;
		} else {
			throw new NotATeachingStaffMember(request.params.courseId, participant.id);
		}
	}

}
