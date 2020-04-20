import { CourseDto } from "../../src/shared/dto/course.dto";

export const COURSE_JAVA_1920: CourseDto = {
	id: "java-wise1920", 
	shortname: "java", 
	semester: "wise1920", 
	title: "Programmierpraktikum I: Java", 
	isClosed: false, 
	link: "test.test",
};

export const COURSE_JAVA_1819: CourseDto = {
	id: "java-wise1819", 
	shortname: "java", 
	semester: "wise1819", 
	title: "Programmierpraktikum I: Java", 
	isClosed: true, 
	link: "test.test",
};

export const COURSE_INFO_2_2020: CourseDto = {
	id: "info2-sose2020", 
	shortname: "info2", 
	semester: "sose2020", 
	title: "Informatik II: Algorithmen und Datenstrukturen", 
	isClosed: false, 
	link: "test.test",
};

export const CoursesMock: CourseDto[] = [
	COURSE_JAVA_1920,
	COURSE_JAVA_1819,
	COURSE_INFO_2_2020
];
