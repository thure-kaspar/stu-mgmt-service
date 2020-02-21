import { CourseDto } from "./course.dto";
import { UserRoles } from "../enums";

export class UserDto {
    id?: string;
    email: string;
    role: UserRoles;
    courses?: CourseDto[];
}