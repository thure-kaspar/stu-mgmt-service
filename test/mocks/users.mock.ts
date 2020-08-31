import { UserDto } from "../../src/shared/dto/user.dto";
import { UserRole, CourseRole } from "../../src/shared/enums";
import { User } from "../../src/shared/entities/user.entity";
import { Participant } from "../../src/course/entities/participant.entity";

export const USER_STUDENT_JAVA: UserDto = {
	id: "a019ea22-5194-4b83-8d31-0de0dc9bca53",
	email: "max.mustermann@test.com",
	displayName: "Max Mustermann",
	username: "mmustermann",
	role: UserRole.USER,
};

export const USER_STUDENT_2_JAVA: UserDto = {
	id: "40f59aad-7473-4455-a3ea-1214f19b2565",
	email: "hans.peter@test.com",
	displayName: "Hans Peter",
	username: "hpeter",
	role: UserRole.USER,
};

export const USER_STUDENT_3_JAVA_TUTOR: UserDto = {
	id: "8330300e-9be7-4a70-ba7d-8a0139311343",
	email: "john.doe@test.com",
	displayName: "John Doe",
	username: "jdoe",
	role: UserRole.USER,
};

export const USER_MGMT_ADMIN_JAVA_LECTURER: UserDto = {
	id: "c17b67ea-d0b7-46bc-a2e0-ea2ec18f441d",
	email: "mgtm.admin@test.com",
	displayName: "Mgtm Admin",
	username: "mAdmin",
	role: UserRole.MGMT_ADMIN,
};

export const USER_SYSTEM_ADMIN: UserDto = {
	id: "d4b50fe8-f949-4317-bdde-d9ae61f53b96",
	email: "system.admin@test.com",
	displayName: "System Admin",
	username: "sAdmin",
	role: UserRole.SYSTEM_ADMIN,
};

export const USER_FROM_AUTH_SYSTEM: UserDto = {
	id: "abc6e1c0-6db0-4c35-8d97-07cc7173c34c",
	email: "user@sparky-system.test",
	displayName: "user",
	username: "authUser",
	role: UserRole.SYSTEM_ADMIN
};

export const USER_KLING_AUTH_SYSTEM: UserDto = {
	id: "6478e13c-aa9c-4483-82e0-96bdca865472",
	email: "kling@email.test",
	displayName: "kling001",
	username: "kling",
	role: UserRole.SYSTEM_ADMIN
};

export const USER_ELSHAR: UserDto = {
	id: "3e52e822-4ebc-49c3-94e2-06ba447b5d1f",
	email: "elshar@test.com",
	displayName: "elshar",
	username: "elshar",
	role: UserRole.SYSTEM_ADMIN
};

export const USER_KUNOLD: UserDto = {
	id: "24b4ec8c-dd8a-4bd6-843c-2c412fb1d5b7",
	email: "kunold@test.com",
	displayName: "kunold",
	username: "kunold",
	role: UserRole.SYSTEM_ADMIN
};

export const USER_NOT_IN_COURSE: UserDto = {
	id: "57951d37-df30-4133-990f-fd12cee5f1bd",
	email: "not.in.course@test.com",
	displayName: "notInCourse",
	username: "notInCourse",
	role: UserRole.USER
};

export const UsersMock: UserDto[] = [
	USER_STUDENT_JAVA, 
	USER_STUDENT_2_JAVA,
	USER_STUDENT_3_JAVA_TUTOR,
	USER_MGMT_ADMIN_JAVA_LECTURER,
	USER_SYSTEM_ADMIN,
	USER_FROM_AUTH_SYSTEM,
	USER_ELSHAR,
	USER_KUNOLD,
	USER_NOT_IN_COURSE
	//USER_KLING_AUTH_SYSTEM
];

export function getUsersOfCourseMock(): User[] {
	const participants: UserDto[] = [
		USER_STUDENT_JAVA, 
		USER_STUDENT_2_JAVA,
		USER_STUDENT_3_JAVA_TUTOR,
		USER_MGMT_ADMIN_JAVA_LECTURER
	];

	const users: User[] = [];

	participants.forEach(p => {
		const user = new User();
		user.id = p.id;
		user.email = p.email;
		user.displayName = p.displayName;
		user.username = p.username;
		user.role = p.role;
		user.participations = [new Participant()];
		user.participations[0].courseId = "java-wise1920";
		user.participations[0].userId = p.id;
		user.participations[0].role = CourseRole.STUDENT;

		users.push(user);
	});

	return users;
}
