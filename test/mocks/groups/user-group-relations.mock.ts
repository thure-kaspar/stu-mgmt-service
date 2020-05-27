import { USER_STUDENT_JAVA, USER_STUDENT_2_JAVA, USER_ELSHAR, USER_KUNOLD } from "../users.mock";
import { GROUP_1_JAVA, GROUP_3_JAVA2020 } from "./groups.mock";

export const UserGroupRelationsMock = [
	{
		id: 1,
		userId: USER_STUDENT_JAVA.id,
		groupId: GROUP_1_JAVA.id
	},
	{
		id: 2,
		userId: USER_STUDENT_2_JAVA.id,
		groupId: GROUP_1_JAVA.id
	},
	{
		id: 3,
		userId: USER_ELSHAR.id,
		groupId: GROUP_3_JAVA2020.id
	},
	{
		id: 4,
		userId: USER_KUNOLD.id,
		groupId: GROUP_3_JAVA2020.id
	},


];
