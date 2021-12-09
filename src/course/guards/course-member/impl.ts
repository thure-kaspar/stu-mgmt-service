import { EntityNotFoundError } from "typeorm";
import { UserDto } from "../../../shared/dto/user.dto";
import { User } from "../../../shared/entities/user.entity";
import { CourseRole, UserRole } from "../../../shared/enums";
import { Participant as ParticipantEntity } from "../../entities/participant.entity";
import { NotACourseMemberException } from "../../exceptions/custom-exceptions";
import { Course } from "../../models/course.model";
import { Participant } from "../../models/participant.model";
import { CourseRepository } from "../../repositories/course.repository";

const adminRoles = [UserRole.SYSTEM_ADMIN, UserRole.MGMT_ADMIN, UserRole.ADMIN_TOOL];

export function isAdmin(role: UserRole): boolean {
	return adminRoles.includes(role);
}

export type CourseMemberGuardRequest = {
	/** User set by {@link AuthGuard} */
	user: UserDto;
	/** Params from the request object. */
	params: { courseId: string };
	/** The resolved {@link Participant}. Must be assigned by this guard. */
	participant?: Participant;
	/** The resolved {@link Course}. Must be assigned by this guard. */
	course?: Course;
};

export async function checkIsCourseMemberOrAdmin(
	request: CourseMemberGuardRequest,
	courseRepository: CourseRepository
): Promise<void> {
	const user = request.user;
	const courseId = request.params.courseId;

	if (isAdmin(user.role)) {
		return handleAdmin(courseRepository, courseId, request, user);
	}

	try {
		const course = await courseRepository.getCourseWithParticipant(courseId, user.id);
		request.participant = new Participant(course.participants[0]);
		course.participants = undefined;
		request.course = new Course(course);
	} catch (error) {
		if (error instanceof EntityNotFoundError) {
			throw new NotACourseMemberException(courseId, user.id);
		}
	}
}

async function handleAdmin(
	courseRepository: CourseRepository,
	courseId: string,
	request: CourseMemberGuardRequest,
	user: UserDto
): Promise<void> {
	const course = await courseRepository.getCourseById(courseId);
	request.course = new Course(course);
	request.participant = new Participant({
		role: CourseRole.LECTURER,
		userId: user.id,
		user: user as User
	} as ParticipantEntity);
}
