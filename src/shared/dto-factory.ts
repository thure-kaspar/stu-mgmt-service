import { AssessmentDto } from "../course/dto/assessment/assessment.dto";
import { AssignmentDto } from "../course/dto/assignment/assignment.dto";
import { AdmissionCriteriaDto } from "../course/dto/course-config/admission-criteria.dto";
import { AssignmentTemplateDto } from "../course/dto/course-config/assignment-template.dto";
import { CourseConfigDto } from "../course/dto/course-config/course-config.dto";
import { GroupSettingsDto } from "../course/dto/course-config/group-settings.dto";
import { ParticipantDto } from "../course/dto/course-participant/participant.dto";
import { CourseDto } from "../course/dto/course/course.dto";
import { GroupDto } from "../course/dto/group/group.dto";
import { AdmissionCriteria } from "../course/entities/admission-criteria.entity";
import { Assessment } from "../course/entities/assessment.entity";
import { AssignmentTemplate } from "../course/entities/assignment-template.entity";
import { Assignment } from "../course/entities/assignment.entity";
import { CourseConfig } from "../course/entities/course-config.entity";
import { Course } from "../course/entities/course.entity";
import { GroupSettings } from "../course/entities/group-settings.entity";
import { Group } from "../course/entities/group.entity";
import { UserDto } from "./dto/user.dto";
import { User } from "./entities/user.entity";
import { CourseRole } from "./enums";
import { toDtos } from "./interfaces/to-dto.interface";

export abstract class DtoFactory {

	static createCourseDto(course: Course): CourseDto {
		const courseDto: CourseDto = {
			id: course.id,
			shortname: course.shortname,
			semester: course.semester,
			title: course.title,
			isClosed: course.isClosed,
			link: course.link ?? undefined
		};

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

	static createAdmissionCriteriaDto(criteria: AdmissionCriteria): AdmissionCriteriaDto {
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
    
		// Add relational data, if available
		if (user.participations) {
			if (user.participations.length == 0) {
				userDto.courses = [];
			} else if (user.participations[0].course) {
				userDto.courses = user.participations.map(rel => this.createCourseDto(rel.course));
			}
		}
    
		return userDto;
	}
	
	static createGroupDto(group: Group): GroupDto {
		const groupDto: GroupDto = {
			id: group.id,
			name: group.name,
			isClosed:group.isClosed,
		};

		if (group.userGroupRelations) {
			groupDto.members = [];

			if (group.userGroupRelations.length && group.userGroupRelations[0].participant) {
				groupDto.members = toDtos(group.userGroupRelations.map(x => x.participant));
			}
		}

		if (group.history) {
			groupDto.history = group.history.map(event => event.toDto());
		}

		return groupDto;
	}
    
	static createAssignmentDto(assignment: Assignment): AssignmentDto {
		const assignmentDto: AssignmentDto = {
			id: assignment.id,
			name: assignment.name,
			state: assignment.state,
			startDate: assignment.startDate ?? undefined,
			endDate: assignment.endDate ?? undefined,
			comment: assignment.comment ?? undefined,
			link: assignment.link ?? undefined,
			type: assignment.type,
			points: assignment.points,
			bonusPoints: assignment.bonusPoints ?? undefined,
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
			comment: assessment.comment ?? undefined,
			creatorId: assessment.creatorId
		};

		if (assessment.partialAssessments) {
			assessmentDto.partialAssessments = assessment.partialAssessments.map(p => p.toDto());
		}

		if (assessment.assignment) {
			assessmentDto.assignment = this.createAssignmentDto(assessment.assignment);
		}

		// If assessment belongs to a single student
		if (assessment.assessmentUserRelations?.length == 1) {
			assessmentDto.userId = assessment.assessmentUserRelations[0].userId;

			if (assessment.assessmentUserRelations[0].user) {
				assessmentDto.user = this.createUserDto(assessment.assessmentUserRelations[0].user);
			}
		}

		// If creator was loaded
		if (assessment.creator) assessmentDto.creator = this.createUserDto(assessment.creator);

		if (assessment.group) {
			assessmentDto.group = this.createGroupDto(assessment.group);
			assessmentDto.group.members = assessment.assessmentUserRelations?.map(rel => {
				const participant: ParticipantDto = { // TODO: GroupId missing
					role: CourseRole.STUDENT,
					userId: rel.userId,
					username: rel.user.username,
					rzName: rel.user.rzName,
				};
				return participant;
			});
		}

		return assessmentDto;
	}

}


