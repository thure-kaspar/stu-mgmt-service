import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UserDto } from "../../shared/dto/user.dto";
import { isLecturer, isTutor } from "../../shared/enums";
import { NotATeachingStaffMember } from "../exceptions/custom-exceptions";
import { CourseParticipantsService } from "../services/course-participants.service";

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

		if (isLecturer(participant) || isTutor(participant)) {
			return true;
		} else {
			throw new NotATeachingStaffMember(request.params.courseId, participant.id);
		}
	}

}
