import { AssignmentDto } from "../../src/shared/dto/assignment.dto";
import { Assignment } from "../../src/shared/entities/assignment.entity";
import { Course } from "../../src/shared/entities/course.entity";
import { CourseDto } from "../../src/shared/dto/course.dto";
import { GroupDto } from "../../src/shared/dto/group.dto";
import { Group } from "../../src/shared/entities/group.entity";
import { UserDto } from "../../src/shared/dto/user.dto";
import { User } from "../../src/shared/entities/user.entity";
import { AssessmentDto } from "../../src/shared/dto/assessment.dto";
import { Assessment } from "../../src/shared/entities/assessment.entity";
import { CourseConfigDto } from "../../src/course/dto/course-config.dto";
import { CourseConfig } from "../../src/course/entities/course-config.entity";

/**
 * Assigns all matching properties to the corresponding Entity.
 * Does not include loaded relations (for now).
 */
export abstract class DtoToEntityConverter {

	static getAssignment(dto: AssignmentDto): Assignment {
		const entity = new Assignment();
		this.assignMatchingProperties(entity, dto);
		return entity;
	}

	static getCourse(dto: CourseDto): Course {
		const entity = new Course();
		this.assignMatchingProperties(entity, dto);
		return entity;
	}

	static getCourseConfig(dto: CourseConfigDto): CourseConfig {
		const entity = new CourseConfig();
		this.assignMatchingProperties(entity, dto);
		return entity;
	}

	static getGroup(dto: GroupDto): Group {
		const entity = new Group();
		this.assignMatchingProperties(entity, dto);
		return entity;
	}

	static getUser(dto: UserDto): User {
		const entity = new User();
		this.assignMatchingProperties(entity, dto);
		return entity;
	}

	static getAssessment(dto: AssessmentDto): Assessment {
		const entity = new Assessment();
		this.assignMatchingProperties(entity, dto);
		return entity;
	}

	private static assignMatchingProperties(target: any, source: any): void {
		Object.keys(source).forEach(key=> target[key]=source[key]);
	}

}
