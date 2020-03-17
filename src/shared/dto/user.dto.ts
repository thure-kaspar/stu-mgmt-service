import { CourseDto } from "./course.dto";
import { UserRole, CourseRole } from "../enums";

export class UserDto {
    id?: string;
	email: string;
	username: string;
	rzName: string;
    role: UserRole;
	courses?: CourseDto[];
	courseRole?: CourseRole;
}
