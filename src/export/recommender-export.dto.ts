import { OmitType } from "@nestjs/swagger";
import { AssignmentDto } from "../course/dto/assignment/assignment.dto";
import { CourseDto } from "../course/dto/course/course.dto";
import { GroupDto } from "../course/dto/group/group.dto";
import { RExportStudent } from "./student-data.dto";

export class RExportGroup extends OmitType(GroupDto, ["history"]) {}

export class RExportRegisteredGroups {
	assignmentId: string;
	groups: RExportGroup;
}
[];

export class RExportDto {
	students: RExportStudent[];
	groups: RExportGroup[];
	assignments: AssignmentDto[];
	groupsForAssignment: RExportRegisteredGroups;
	course: CourseDto;
}
