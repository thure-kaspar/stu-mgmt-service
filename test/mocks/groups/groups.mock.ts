import { GroupDto } from "../../../src/course/dto/group/group.dto";
import { COURSE_JAVA_1920, COURSE_JAVA_2020 } from "../courses.mock";

export const GROUP_1_JAVA: GroupDto = {
	id: "b4f24e81-dfa4-4641-af80-8e34e02d9c4a",
	courseId: COURSE_JAVA_1920.id,
	name: "Testgroup 1",
	password: "123",
	isClosed: false
};

export const GROUP_2_JAVA: GroupDto = {
	id: "73b2afad-7198-4f99-86dc-a2c46c03db2c",
	courseId: COURSE_JAVA_1920.id,
	name: "Testgroup 2",
	password: "123",
	isClosed: true
};

export const GROUP_3_JAVA2020: GroupDto = {
	id: "f2cd0543-e699-40f3-9eb1-ea59a3c91abe",
	courseId: COURSE_JAVA_2020.id,
	name: "JAVA-001",
	isClosed: false
};

export const GroupsMock: GroupDto[] = [
	GROUP_1_JAVA, 
	GROUP_2_JAVA, 
	GROUP_3_JAVA2020
];
