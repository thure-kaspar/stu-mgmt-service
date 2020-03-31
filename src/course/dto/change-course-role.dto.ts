import { CourseRole } from "../../shared/enums";
import { IsNotEmpty } from "class-validator";

export class ChangeCourseRoleDto {
	@IsNotEmpty()
	role: CourseRole;
}
