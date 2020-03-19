import { Course } from "./entities/course.entity";
import { CourseDto } from "./dto/course.dto";
import { UserDto } from "./dto/user.dto";
import { User } from "./entities/user.entity";
import { GroupDto } from "./dto/group.dto";
import { Group } from "./entities/group.entity";
import { AssignmentDto } from "./dto/assignment.dto";
import { Assignment } from "./entities/assignment.entity";
import { Assessment } from "./entities/assessment.entity";
import { AssessmentDto } from "./dto/assessment.dto";
import { CourseRole } from "./enums";

export abstract class DtoFactory {

	static createCourseDto(course: Course): CourseDto {
		const courseDto: CourseDto = {
			id: course.id,
			shortname: course.shortname,
			semester: course.semester,
			title: course.title,
			isClosed: course.isClosed,
			link: course.link,
			allowGroups: course.allowGroups,
			maxGroupSize: course.maxGroupSize
		};
    
		// Add relational data, if available
		if (course.courseUserRelations) {
			courseDto.users = course.courseUserRelations.map(courseUserRelation => 
				this.createUserDto(courseUserRelation.user, courseUserRelation.role));
		}
		
		if (course.assignments) {
			courseDto.assignments = course.assignments.map(assignment => this.createAssignmentDto(assignment));
		}

		if (course.groups) {
			courseDto.groups = course.groups.map(group => this.createGroupDto(group));
		}
    
		return courseDto;
	}
    
	static createUserDto(user: User, courseRole?: CourseRole): UserDto {
		const userDto: UserDto = {
			id: user.id,
			email: user.email,
			username: user.username,
			rzName: user.rzName,
			role: user.role,
		};
 
		// If users of a course a loaded, assign course role (i.e Student)
		if (courseRole) userDto.courseRole = courseRole;
    
		// Add relational data, if available
		if (user.courseUserRelations) {
			userDto.courses = user.courseUserRelations.map(courseUserRelation => this.createCourseDto(courseUserRelation.course));
		}
    
		return userDto;
	}
	
	// TODO: Allow loading members
	static createGroupDto(group: Group): GroupDto {
		const groupDto: GroupDto = {
			id: group.id,
			courseId: group.courseId,
			name: group.name,
			isClosed:group.isClosed,
		};

		if (group.course) groupDto.course = this.createCourseDto(group.course);

		return groupDto;
	}
    
	static createAssignmentDto(assignment: Assignment): AssignmentDto {
		const assignmentDto: AssignmentDto = {
			id: assignment.id,
			courseId: assignment.courseId,
			name: assignment.name,
			state: assignment.state,
			startDate: assignment.startDate,
			endDate: assignment.endDate,
			comment: assignment.comment,
			link: assignment.link,
			type: assignment.type,
			maxPoints: assignment.maxPoints,
			collaborationType: assignment.collaborationType
		};
		return assignmentDto;
	}
    
	static createAssessmentDto(assessment: Assessment): AssessmentDto {
		const assessmentDto: AssessmentDto = {
			id: assessment.id,
			assignmentId: assessment.assignmentId,
			groupId: assessment.groupId,
			achievedPoints: assessment.achievedPoints,
			comment: assessment.comment,
			creatorId: assessment.creatorId
		};

		// If assessment belongs to a single student
		if (assessment.assessmentUserRelations?.length == 1) {
			assessmentDto.userId = assessment.assessmentUserRelations[0].userId;
		}

		// If creator was loaded
		if (assessment.creator) assessmentDto.creator = this.createUserDto(assessment.creator);
	
		// TODO: Fix: Group will contain current members, but we want members from assessmentUserRelations!
		if (assessment.group) {
			assessmentDto.group = this.createGroupDto(assessment.group);
		}
    
		return assessmentDto;
	}

}


