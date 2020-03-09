import { CourseDto } from "./course.dto";
import { UserRole } from "../enums";

export class UserDto {
    id?: string;
    email: string;
    role: UserRole;
    courses?: CourseDto[];
}