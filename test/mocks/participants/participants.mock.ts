import { COURSE_JAVA_1920, COURSE_INFO_2_2020, COURSE_JAVA_2020 } from "../courses.mock";
import {
	USER_STUDENT_JAVA,
	USER_STUDENT_2_JAVA,
	USER_STUDENT_3_JAVA_TUTOR,
	USER_MGMT_ADMIN_JAVA_LECTURER,
	USER_ELSHAR,
	USER_KUNOLD,
	USER_FROM_AUTH_SYSTEM
} from "../users.mock";
import { CourseRole } from "../../../src/shared/enums";
import { ParticipantDto } from "../../../src/course/dto/course-participant/participant.dto";
import { GROUP_1_JAVA } from "../groups/groups.mock";
import { UserDto } from "../../../src/shared/dto/user.dto";
import { CourseDto } from "../../../src/course/dto/course/course.dto";
import { GroupDto } from "../../../src/course/dto/group/group.dto";
import { CourseId } from "../../../src/course/entities/course.entity";
import { UserId } from "../../../src/shared/entities/user.entity";

/** Type alias for course participants creation. */
type ParticipantDtoWithId = { participant: ParticipantDto; id: number; userId: UserId };
type CourseIdParticipantWithIds = { courseId: CourseId; participant: ParticipantDtoWithId }[];

/** Factory-Method for creating a ParticipantDto. */
export const PARTICIPANT_DTO = (
	user: UserDto,
	course: CourseDto,
	role: CourseRole,
	groupId?: string,
	group?: GroupDto
): ParticipantDto => ({
	userId: user.id,
	username: user.username,
	displayName: user.displayName,
	email: user.email,
	role: role,
	groupId: groupId,
	group: group // Not included in every request, so it is included as optional parameter
});

//#region JAVA_1920
export const PARTICIPANT_JAVA_1920_STUDENT: ParticipantDtoWithId = {
	participant: PARTICIPANT_DTO(
		USER_STUDENT_JAVA,
		COURSE_JAVA_1920,
		CourseRole.STUDENT,
		GROUP_1_JAVA.id
	),
	id: 1,
	userId: USER_STUDENT_JAVA.id
};

export const PARTICIPANT_JAVA_1920_STUDENT_2: ParticipantDtoWithId = {
	participant: PARTICIPANT_DTO(
		USER_STUDENT_2_JAVA,
		COURSE_JAVA_1920,
		CourseRole.STUDENT,
		GROUP_1_JAVA.id
	),
	id: 2,
	userId: USER_STUDENT_2_JAVA.id
};

export const PARTICIPANT_JAVA_1920_TUTOR: ParticipantDtoWithId = {
	participant: PARTICIPANT_DTO(USER_STUDENT_3_JAVA_TUTOR, COURSE_JAVA_1920, CourseRole.TUTOR),
	id: 3,
	userId: USER_STUDENT_3_JAVA_TUTOR.id
};

export const PARTICIPANT_JAVA_1920_LECTURER: ParticipantDtoWithId = {
	participant: PARTICIPANT_DTO(
		USER_MGMT_ADMIN_JAVA_LECTURER,
		COURSE_JAVA_1920,
		CourseRole.LECTURER
	),
	id: 4,
	userId: USER_MGMT_ADMIN_JAVA_LECTURER.id
};

export const PARTICIPANT_JAVA_1920_STUDENT_ELSHAR: ParticipantDtoWithId = {
	participant: PARTICIPANT_DTO(USER_ELSHAR, COURSE_JAVA_1920, CourseRole.STUDENT),
	id: 5,
	userId: USER_ELSHAR.id
};

export const PARTICIPANT_JAVA_1920_STUDENT_KUNOLD: ParticipantDtoWithId = {
	participant: PARTICIPANT_DTO(USER_KUNOLD, COURSE_JAVA_1920, CourseRole.STUDENT),
	id: 6,
	userId: USER_KUNOLD.id
};

export const PARTICIPANT_JAVA_1920_STUDENT_FROM_AUTH_SYSTEM: ParticipantDtoWithId = {
	participant: PARTICIPANT_DTO(USER_FROM_AUTH_SYSTEM, COURSE_JAVA_1920, CourseRole.TUTOR),
	id: 7,
	userId: USER_FROM_AUTH_SYSTEM.id
};

export const COURSE_JAVA_1920_PARTICIPANTS: CourseIdParticipantWithIds = [
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_STUDENT },
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_STUDENT_2 },
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_TUTOR },
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_LECTURER },
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_STUDENT_ELSHAR },
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_STUDENT_KUNOLD },
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_STUDENT_FROM_AUTH_SYSTEM }
];
//#endregion

//#region JAVA_2020
export const PARTICIPANT_JAVA_2020_ELSHAR: ParticipantDtoWithId = {
	participant: PARTICIPANT_DTO(USER_ELSHAR, COURSE_JAVA_2020, CourseRole.STUDENT),
	id: 8,
	userId: USER_ELSHAR.id
};

export const PARTICIPANT_JAVA_2020_KUNOLD: ParticipantDtoWithId = {
	participant: PARTICIPANT_DTO(USER_KUNOLD, COURSE_JAVA_2020, CourseRole.STUDENT),
	id: 9,
	userId: USER_KUNOLD.id
};

export const COURSE_JAVA_2020_PARTICIPANTS: CourseIdParticipantWithIds = [
	{ courseId: COURSE_JAVA_2020.id, participant: PARTICIPANT_JAVA_2020_ELSHAR },
	{ courseId: COURSE_JAVA_2020.id, participant: PARTICIPANT_JAVA_2020_KUNOLD }
];
//#endregion

//#region INFO_2_2020
export const PARTICIPANT_INFO_2_2020_LECTURER: ParticipantDtoWithId = {
	participant: PARTICIPANT_DTO(
		USER_MGMT_ADMIN_JAVA_LECTURER,
		COURSE_INFO_2_2020,
		CourseRole.LECTURER
	),
	id: 10,
	userId: USER_MGMT_ADMIN_JAVA_LECTURER.id
};

export const COURSE_INFO_2_2020_PARTICIPANTS: CourseIdParticipantWithIds = [
	{ courseId: COURSE_INFO_2_2020.id, participant: PARTICIPANT_INFO_2_2020_LECTURER }
];
//#endregion

export const COURSE_PARTICIPANTS_ALL: CourseIdParticipantWithIds = [
	...COURSE_JAVA_1920_PARTICIPANTS,
	...COURSE_JAVA_2020_PARTICIPANTS,
	...COURSE_INFO_2_2020_PARTICIPANTS
];
