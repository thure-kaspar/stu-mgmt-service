import { UserDto } from "./user.dto";

export class CourseDto {
    id: number;
    courseId: number;
    semester: string;
    title: string;
    isClosed: boolean;
    password?: string;
    link?: string;
    users?: UserDto[];
    // assignments?: any[] // AssignmentDto[]
}