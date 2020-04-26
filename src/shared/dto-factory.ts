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
import { CourseConfig } from "../course/entities/course-config.entity";
import { CourseConfigDto } from "../course/dto/course-config.dto";
import { GroupSettings } from "../course/entities/group-settings.entity";
import { GroupSettingsDto } from "../course/dto/group-settings.dto";
import { AdmissionCritera } from "../course/entities/admission-criteria.entity";
import { AdmissionCriteriaDto } from "../course/dto/admission-criteria.dto";
import { AssignmentTemplate } from "../course/entities/assignment-template.entity";
import { AssignmentTemplateDto } from "../course/dto/assignment-template.dto";

export abstract class DtoFactory {

	static createCourseDto(course: Course): CourseDto {
		const courseDto: CourseDto = {
			id: course.id,
			shortname: course.shortname,
			semester: course.semester,
			title: course.title,
			isClosed: course.isClosed,
			link: course.link
		};
		
		// Add relational data, if available
		if (course.courseUserRelations && course.courseUserRelations[0].user) {
			courseDto.users = course.courseUserRelations.map(courseUserRelation => 
				this.createUserDto(courseUserRelation.user, courseUserRelation.role));
		}
		
		if (course.assignments) {
			courseDto.assignments = course.assignments.map(assignment => this.createAssignmentDto(assignment));
		}

		if (course.groups) {
			courseDto.groups = course.groups.map(group => this.createGroupDto(group));
		}

		if (course.config) {
			courseDto.config = this.createCourseConfigDto(course.config);
		}
    
		return courseDto;
	}

	static createCourseConfigDto(config: CourseConfig, includePriviliged = false): CourseConfigDto {
		const configDto: CourseConfigDto = { };
		if (config.admissionCriteria) 
			configDto.admissionCriteria = this.createAdmissionCriteriaDto(config.admissionCriteria);

		if (config.groupSettings)
			configDto.groupSettings = this.createGroupSettingsDto(config.groupSettings);

		if (config.assignmentTemplates)
			configDto.assignmentTemplates = config.assignmentTemplates.map(t => this.createAssignmentTemplateDto(t));
		
		if (includePriviliged) {
			configDto.password = config.password;
			configDto.subscriptionUrl = config.subscriptionUrl;
		}
		return configDto;
	}

	static createGroupSettingsDto(settings: GroupSettings): GroupSettingsDto {
		return {
			allowGroups: settings.allowGroups,
			nameSchema: settings.nameSchema,
			sizeMin: settings.sizeMin,
			sizeMax: settings.sizeMax,
			selfmanaged: settings.selfmanaged
		};
	}

	static createAdmissionCriteriaDto(criteria: AdmissionCritera): AdmissionCriteriaDto {
		const criteriaDto: AdmissionCriteriaDto = criteria.admissionCriteria;
		return criteriaDto;
	}

	static createAssignmentTemplateDto(template: AssignmentTemplate): AssignmentTemplateDto {
		return {
			id: template.id,
			name: template.name,
			collaboration: template.collaboration,
			type: template.type,
			titleSchema: template.titleSchema,
			points: template.points
		};
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
			points: assignment.points,
			bonusPoints: assignment.bonusPoints,
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


