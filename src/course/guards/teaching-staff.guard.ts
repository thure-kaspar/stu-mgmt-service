import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { NotATeachingStaffMember } from "../exceptions/custom-exceptions";
import { Participant } from "../models/participant.model";
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
		const participant: Participant = request.participant;

		if (participant.isLecturer() || participant.isTutor()) {
			return true;
		} else {
			throw new NotATeachingStaffMember(request.params.courseId, participant.userId);
		}
	}

}
