import { COURSE_JAVA_1920, COURSE_INFO_2_2020, COURSE_JAVA_2020 } from "../courses.mock";
import { USER_STUDENT_JAVA, USER_STUDENT_2_JAVA, USER_STUDENT_3_JAVA_TUTOR, USER_MGMT_ADMIN_JAVA_LECTURER, USER_ELSHAR, USER_KUNOLD, USER_FROM_AUTH_SYSTEM } from "../users.mock";
import { CourseRole } from "../../../src/shared/enums";
import { ParticipantDto } from "../../../src/course/dto/course-participant/participant.dto";
import { GROUP_1_JAVA } from "../groups/groups.mock";
import { UserDto } from "../../../src/shared/dto/user.dto";
import { CourseDto } from "../../../src/course/dto/course/course.dto";
import { GroupDto } from "../../../src/course/dto/group/group.dto";
import { CourseId } from "../../../src/course/entities/course.entity";

/** Type alias for course participants creation. */
type CourseIdParticipantWithIds =
{ courseId: CourseId; participant: ParticipantDto; id: number}[]

/** Factory-Method for creating a ParticipantDto. */
export const PARTICIPANT_DTO = (user: UserDto, course: CourseDto, role: CourseRole, groupId?: string, group?: GroupDto): ParticipantDto => ({
	userId: user.id,
	username: user.username,
	rzName: user.rzName,
	role: role,
	groupId: groupId,
	group: group // Not included in every request, so it is included as optional parameter
});

//#region JAVA_1920
export const PARTICIPANT_JAVA_1920_STUDENT: ParticipantDto = 
	PARTICIPANT_DTO(USER_STUDENT_JAVA, COURSE_JAVA_1920, CourseRole.STUDENT, GROUP_1_JAVA.id);

export const PARTICIPANT_JAVA_1920_STUDENT_2: ParticipantDto = 
	PARTICIPANT_DTO(USER_STUDENT_2_JAVA, COURSE_JAVA_1920, CourseRole.STUDENT, GROUP_1_JAVA.id);

export const PARTICIPANT_JAVA_1920_TUTOR: ParticipantDto = 
	PARTICIPANT_DTO(USER_STUDENT_3_JAVA_TUTOR, COURSE_JAVA_1920, CourseRole.TUTOR);

export const PARTICIPANT_JAVA_1920_LECTURER: ParticipantDto = 
	PARTICIPANT_DTO(USER_MGMT_ADMIN_JAVA_LECTURER, COURSE_JAVA_1920, CourseRole.LECTURER);

export const PARTICIPANT_JAVA_1920_STUDENT_ELSHAR: ParticipantDto = 
	PARTICIPANT_DTO(USER_ELSHAR, COURSE_JAVA_1920, CourseRole.STUDENT);

export const PARTICIPANT_JAVA_1920_STUDENT_KUNOLD: ParticipantDto = 
	PARTICIPANT_DTO(USER_KUNOLD, COURSE_JAVA_1920, CourseRole.STUDENT);

export const PARTICIPANT_JAVA_1920_STUDENT_FROM_AUTH_SYSTEM: ParticipantDto = 
	PARTICIPANT_DTO(USER_FROM_AUTH_SYSTEM, COURSE_JAVA_1920, CourseRole.STUDENT);

export const COURSE_JAVA_1920_PARTICIPANTS: CourseIdParticipantWithIds = [
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_STUDENT, id: 1 },
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_STUDENT_2, id: 2 },
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_TUTOR, id: 3 },
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_LECTURER, id: 4 },
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_STUDENT_ELSHAR, id: 5 },
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_STUDENT_KUNOLD, id: 6 },
	{ courseId: COURSE_JAVA_1920.id, participant: PARTICIPANT_JAVA_1920_STUDENT_FROM_AUTH_SYSTEM, id: 7 }
];
//#endregion

//#region JAVA_2020
export const PARTICIPANT_JAVA_2020_ELSHAR: ParticipantDto = 
	PARTICIPANT_DTO(USER_ELSHAR, COURSE_JAVA_2020, CourseRole.STUDENT);

export const PARTICIPANT_JAVA_2020_KUNOLD: ParticipantDto = 
	PARTICIPANT_DTO(USER_KUNOLD, COURSE_JAVA_2020, CourseRole.STUDENT);

export const COURSE_JAVA_2020_PARTICIPANTS: { courseId: CourseId; participant: ParticipantDto; id: number}[] = [
	{ courseId: COURSE_JAVA_2020.id, participant: PARTICIPANT_JAVA_2020_ELSHAR, id: 8 },
	{ courseId: COURSE_JAVA_2020.id, participant: PARTICIPANT_JAVA_2020_KUNOLD, id: 9 },
];
//#endregion

//#region INFO_2_2020
export const PARTICIPANT_INFO_2_2020_LECTURER: ParticipantDto = 
	PARTICIPANT_DTO(USER_MGMT_ADMIN_JAVA_LECTURER, COURSE_INFO_2_2020, CourseRole.LECTURER);

export const COURSE_INFO_2_2020_PARTICIPANTS: CourseIdParticipantWithIds = [
	{ courseId: COURSE_INFO_2_2020.id, participant: PARTICIPANT_INFO_2_2020_LECTURER, id: 10 }
];


//#endregion

export const COURSE_PARTICIPANTS_ALL: CourseIdParticipantWithIds = [
	...COURSE_JAVA_1920_PARTICIPANTS,
	...COURSE_JAVA_2020_PARTICIPANTS,
	...COURSE_INFO_2_2020_PARTICIPANTS
];
