import { Course } from "../course/entities/course.entity";
import { CourseDto } from "../course/dto/course/course.dto";
import { UserDto } from "./dto/user.dto";
import { User } from "./entities/user.entity";
import { GroupDto } from "../course/dto/group/group.dto";
import { Group } from "../course/entities/group.entity";
import { AssignmentDto } from "../course/dto/assignment/assignment.dto";
import { Assignment } from "../course/entities/assignment.entity";
import { Assessment } from "../course/entities/assessment.entity";
import { AssessmentDto } from "../course/dto/assessment/assessment.dto";
import { CourseRole } from "./enums";
import { CourseConfig } from "../course/entities/course-config.entity";
import { CourseConfigDto } from "../course/dto/course-config/course-config.dto";
import { GroupSettings } from "../course/entities/group-settings.entity";
import { GroupSettingsDto } from "../course/dto/course-config/group-settings.dto";
import { AdmissionCritera } from "../course/entities/admission-criteria.entity";
import { AdmissionCriteriaDto } from "../course/dto/course-config/admission-criteria.dto";
import { AssignmentTemplate } from "../course/entities/assignment-template.entity";
import { AssignmentTemplateDto } from "../course/dto/course-config/assignment-template.dto";

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
			templateName: template.templateName,
			collaboration: template.collaboration,
			type: template.type,
			name: template.name,
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
	
	static createGroupDto(group: Group): GroupDto {
		const groupDto: GroupDto = {
			id: group.id,
			courseId: group.courseId,
			name: group.name,
			isClosed:group.isClosed,
		};

		if (group.course) groupDto.course = this.createCourseDto(group.course);

		if (group.userGroupRelations) {
			groupDto.users = [];

			if (group.userGroupRelations.length && group.userGroupRelations[0].user) {
				groupDto.users = group.userGroupRelations.map(rel => this.createUserDto(rel.user));
			}
		}

		if (group.assessments) {
			groupDto.assessments = group.assessments.map(a => this.createAssessmentDto(a));
		}

		if (group.history) {
			groupDto.history = group.history.map(event => event.toDto());
		}

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
			collaboration: assignment.collaboration
		};
		return assignmentDto;
	}
    
	static createAssessmentDto(assessment: Assessment): AssessmentDto {
		const assessmentDto: AssessmentDto = {
			id: assessment.id,
			assignmentId: assessment.assignmentId,
			groupId: assessment.groupId ?? undefined,
			achievedPoints: assessment.achievedPoints,
			comment: assessment.comment,
			creatorId: assessment.creatorId
		};

		if (assessment.partialAssessments) {
			assessmentDto.partialAssessments = assessment.partialAssessments.map(p => p.toDto());
		}

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


