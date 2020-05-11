import { USER_STUDENT_JAVA, USER_STUDENT_2_JAVA } from "../users.mock";
import { GROUP_1_JAVA } from "./groups.mock";

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
	}

];
