import { UserDto } from "./user.dto";
import { GroupDto } from "./group.dto";
import { AssignmentDto } from "./assignment.dto";

export class CourseDto {
    id?: string; // Optional: If (unused) id is supplied for creation, it will be used
    shortname: string;
    semester: string;
    title: string;
    isClosed: boolean;
    password?: string;
	link?: string;
	allowGroups: boolean;
	maxGroupSize: number;
    users?: UserDto[];
	groups?: GroupDto[];
	assignments?: AssignmentDto[];
}
