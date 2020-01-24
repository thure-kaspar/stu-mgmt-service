import { CourseDto } from "./course.dto";
import { UserDto } from "./user.dto";

export class GroupDto {
    id: string;
    name: string;
    password: string;
    isClosed: boolean;
    course: CourseDto;
    users?: UserDto[];
}