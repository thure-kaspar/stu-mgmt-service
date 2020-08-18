import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Course as CourseEntity } from "../entities/course.entity";
import { GroupId } from "../entities/group.entity";
import { NotAGroupMemberException } from "../exceptions/custom-exceptions";
import { Participant } from "../models/participant.model";
import { CourseRepository } from "../repositories/course.repository";

/**
 * Only allows requests for users, that are either member of the group or teaching staff.
 * Assumes that request body has requesting `participant` attached to it (done by `CourseMemberGuard`).
 * 
 * @throws `NotACourseMemberException`
 */
@Injectable()
export class GroupMemberGuard implements CanActivate {
	
	constructor(@InjectRepository(CourseEntity) private courses: CourseRepository) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {	
		const request = context.switchToHttp().getRequest();
		const participant: Participant = request.participant;
		const groupId: GroupId = request.params.groupId;

		if (participant.isLecturer() || participant.isTutor() || participant.groupId === groupId) {
			return true;
		} else {
			throw new NotAGroupMemberException(groupId, participant.userId);
		}
	}

}
