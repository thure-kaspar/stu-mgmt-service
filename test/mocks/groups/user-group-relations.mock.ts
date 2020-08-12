import { UserGroupRelation } from "../../../src/course/entities/user-group-relation.entity";
import { PARTICIPANT_JAVA_1920_STUDENT, PARTICIPANT_JAVA_1920_STUDENT_2, PARTICIPANT_JAVA_1920_STUDENT_ELSHAR, PARTICIPANT_JAVA_1920_STUDENT_KUNOLD, PARTICIPANT_JAVA_2020_ELSHAR, PARTICIPANT_JAVA_2020_KUNOLD } from "../participants/participants.mock";
import { USER_ELSHAR, USER_KUNOLD, USER_STUDENT_2_JAVA, USER_STUDENT_JAVA } from "../users.mock";
import { GROUP_1_JAVA, GROUP_3_JAVA2020, GROUP_4_JAVA } from "./groups.mock";

export const UserGroupRelationsMock: Partial<UserGroupRelation>[] = [
	{
		id: 1,
		participantId: PARTICIPANT_JAVA_1920_STUDENT.id,
		userId: USER_STUDENT_JAVA.id,
		groupId: GROUP_1_JAVA.id,
	},
	{
		id: 2,
		participantId: PARTICIPANT_JAVA_1920_STUDENT_2.id,
		userId: USER_STUDENT_2_JAVA.id,
		groupId: GROUP_1_JAVA.id
	},
	{
		id: 3,
		participantId: PARTICIPANT_JAVA_2020_ELSHAR.id,
		userId: USER_ELSHAR.id,
		groupId: GROUP_3_JAVA2020.id
	},
	{
		id: 4,
		participantId: PARTICIPANT_JAVA_2020_KUNOLD.id,
		userId: USER_KUNOLD.id,
		groupId: GROUP_3_JAVA2020.id
	},
	{
		id: 5,
		participantId: PARTICIPANT_JAVA_1920_STUDENT_ELSHAR.id,
		userId: USER_ELSHAR.id,
		groupId: GROUP_4_JAVA.id
	},
	{
		id: 5,
		participantId: PARTICIPANT_JAVA_1920_STUDENT_KUNOLD.id,
		userId: USER_KUNOLD.id,
		groupId: GROUP_4_JAVA.id
	}
];
