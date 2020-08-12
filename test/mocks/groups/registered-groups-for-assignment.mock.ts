import { GroupDto } from "../../../src/course/dto/group/group.dto";
import { Group } from "../../../src/course/entities/group.entity";
import { UserGroupRelation } from "../../../src/course/entities/user-group-relation.entity";
import { UserDto } from "../../../src/shared/dto/user.dto";
import { convertToEntity } from "../../utils/object-helper";
import { User } from "../../../src/shared/entities/user.entity";
import { GROUP_1_JAVA, GROUP_4_JAVA, GROUP_3_JAVA2020 } from "./groups.mock";
import { USER_STUDENT_JAVA, USER_STUDENT_2_JAVA, USER_ELSHAR, USER_KUNOLD } from "../users.mock";
import { CourseId } from "../../../src/course/entities/course.entity";
import { COURSE_JAVA_1920, COURSE_JAVA_2020 } from "../courses.mock";

export function createGroupWithMembers(group: GroupDto, members: UserDto[]): Group {
	return new Group({
		...group as any,
		userGroupRelations: members.map(user => new UserGroupRelation({
			groupId: group.id,
			userId: user.id,
			user: convertToEntity(User, user)
		}))
	});
}

export const GROUP_1_DEFAULT = createGroupWithMembers(GROUP_1_JAVA, [USER_STUDENT_JAVA, USER_STUDENT_2_JAVA]);
export const GROUP_2_DEFAULT = createGroupWithMembers(GROUP_4_JAVA, [USER_ELSHAR, USER_KUNOLD]);
export const GROUP_3_DEFAULT = createGroupWithMembers(GROUP_3_JAVA2020, [USER_ELSHAR, USER_KUNOLD]);

export const REGISTERED_GROUPS_AND_MEMBERS: { group: Group; courseId: CourseId }[] = [
	{ group: GROUP_1_DEFAULT, courseId: COURSE_JAVA_1920.id },
	{ group: GROUP_2_DEFAULT, courseId: COURSE_JAVA_1920.id },
	{ group: GROUP_3_DEFAULT, courseId: COURSE_JAVA_2020.id },
];
