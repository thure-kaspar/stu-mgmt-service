import { CourseDto } from "./course.dto";

export class AssignmentDto {
	id: string;
	courseId: string;
	name: string;
	comment: string;
	link: string;
	type: string;
	maxPoints: number;
}