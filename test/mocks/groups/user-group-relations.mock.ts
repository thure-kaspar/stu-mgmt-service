import { USER_STUDENT_JAVA, USER_STUDENT_2_JAVA, USER_ELSHAR, USER_KUNOLD } from "../users.mock";
import { GROUP_1_JAVA, GROUP_3_JAVA2020, GROUP_4_JAVA } from "./groups.mock";
import { UserGroupRelation } from "../../../src/course/entities/user-group-relation.entity";
import { COURSE_JAVA_1920_PARTICIPANTS, COURSE_JAVA_2020_PARTICIPANTS } from "../participants/participants.mock";
import { COURSE_JAVA_1920, COURSE_JAVA_2020 } from "../courses.mock";

export const UserGroupRelationsMock: Partial<UserGroupRelation>[] = [
	{
		id: 1,
		participantId: COURSE_JAVA_1920_PARTICIPANTS.find(p => p.courseId === COURSE_JAVA_1920.id && p.participant.userId === USER_STUDENT_JAVA.id).id,
		userId: USER_STUDENT_JAVA.id,
		groupId: GROUP_1_JAVA.id,
	},
	{
		id: 2,
		participantId: COURSE_JAVA_1920_PARTICIPANTS.find(p => p.courseId === COURSE_JAVA_1920.id && p.participant.userId === USER_STUDENT_2_JAVA.id).id,
		userId: USER_STUDENT_2_JAVA.id,
		groupId: GROUP_1_JAVA.id
	},
	{
		id: 3,
		participantId: COURSE_JAVA_2020_PARTICIPANTS.find(p => p.courseId === COURSE_JAVA_2020.id && p.participant.userId === USER_ELSHAR.id).id,
		userId: USER_ELSHAR.id,
		groupId: GROUP_3_JAVA2020.id
	},
	{
		id: 4,
		participantId: COURSE_JAVA_2020_PARTICIPANTS.find(p => p.courseId === COURSE_JAVA_2020.id && p.participant.userId === USER_KUNOLD.id).id,
		userId: USER_KUNOLD.id,
		groupId: GROUP_3_JAVA2020.id
	},
	{
		id: 5,
		participantId: COURSE_JAVA_1920_PARTICIPANTS.find(p => p.courseId === COURSE_JAVA_1920.id && p.participant.userId === USER_ELSHAR.id).id,
		userId: USER_ELSHAR.id,
		groupId: GROUP_4_JAVA.id
	},
	{
		id: 5,
		participantId: COURSE_JAVA_1920_PARTICIPANTS.find(p => p.courseId === COURSE_JAVA_1920.id && p.participant.userId === USER_KUNOLD.id).id,
		userId: USER_KUNOLD.id,
		groupId: GROUP_4_JAVA.id
	}
];
