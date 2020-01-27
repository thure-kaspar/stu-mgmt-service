import { UserDto } from "./user.dto";
import { GroupDto } from "./group.dto";

export class CourseDto {
    id: string;
    shortname: string;
    semester: string;
    title: string;
    isClosed: boolean;
    password?: string;
    link?: string;
    users?: UserDto[];
    groups?: GroupDto[];
    // assignments?: any[] // AssignmentDto[]
}