import { AssessmentDto } from "../assessment/dto/assessment.dto";
import { Assessment } from "../assessment/entities/assessment.entity";
import { AssignmentDto } from "../course/dto/assignment/assignment.dto";
import { AdmissionCriteriaDto } from "../course/dto/course-config/admission-criteria.dto";
import { AssignmentTemplateDto } from "../course/dto/course-config/assignment-template.dto";
import { CourseConfigDto } from "../course/dto/course-config/course-config.dto";
import { GroupSettingsDto } from "../course/dto/course-config/group-settings.dto";
import { ParticipantDto } from "../course/dto/course-participant/participant.dto";
import { CourseDto } from "../course/dto/course/course.dto";
import { GroupDto } from "../course/dto/group/group.dto";
import { AdmissionCriteria } from "../course/entities/admission-criteria.entity";
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
		return {
			id: course.id,
			shortname: course.shortname,
			semester: course.semester,
			title: course.title,
			isClosed: course.isClosed,
			links: course.links ?? undefined,
			groupSettings: course.config?.groupSettings?.toDto(),
			admissionCriteria: course.config?.admissionCriteria?.toDto()
		};
	}

	static createCourseConfigDto(config: CourseConfig, includePrivileged = false): CourseConfigDto {
		const configDto: CourseConfigDto = {};
		if (config.admissionCriteria)
			configDto.admissionCriteria = this.createAdmissionCriteriaDto(config.admissionCriteria);

		if (config.groupSettings)
			configDto.groupSettings = this.createGroupSettingsDto(config.groupSettings);

		if (config.assignmentTemplates)
			configDto.assignmentTemplates = config.assignmentTemplates.map(t =>
				this.createAssignmentTemplateDto(t)
			);

		if (includePrivileged) {
			configDto.password = config.password;
		}
		return configDto;
	}

	static createGroupSettingsDto(settings: GroupSettings): GroupSettingsDto {
		return {
			allowGroups: settings.allowGroups,
			nameSchema: settings.nameSchema,
			sizeMin: settings.sizeMin,
			sizeMax: settings.sizeMax,
			selfmanaged: settings.selfmanaged,
			autoJoinGroupOnCourseJoined: settings.autoJoinGroupOnCourseJoined,
			mergeGroupsOnAssignmentStarted: settings.mergeGroupsOnAssignmentStarted
		};
	}

	static createAdmissionCriteriaDto(criteria: AdmissionCriteria): AdmissionCriteriaDto {
		return criteria.admissionCriteria;
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

	static createUserDto(user: User, options?: { removeEmail: boolean }): UserDto {
		const userDto: UserDto = {
			id: user.id,
			matrNr: user.matrNr,
			email: options?.removeEmail ? undefined : user.email,
			username: user.username,
			displayName: user.displayName,
			role: user.role
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

	static createGroupDto(group: Group, options?: { includePassword: boolean }): GroupDto {
		const groupDto: GroupDto = {
			id: group.id,
			name: group.name,
			isClosed: group.isClosed,
			password: options?.includePassword ? group.password : undefined,
			hasPassword: !!group.password
		};

		if (group.userGroupRelations) {
			groupDto.size = group.userGroupRelations.length;
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
			links: assignment.links ?? undefined,
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
			isDraft: assessment.isDraft,
			achievedPoints: assessment.achievedPoints,
			comment: assessment.comment ?? undefined,
			creatorId: assessment.creatorId,
			lastUpdatedById: assessment.lastUpdatedById ?? undefined,
			creationDate: assessment.creationDate,
			updateDate: assessment.updateDate,
			partialAssessments: assessment.partialAssessments?.map(p => p.toDto())
		};

		if (!assessmentDto.isDraft && assessmentDto.partialAssessments?.length > 0) {
			assessmentDto.partialAssessments.filter(p => !p.draftOnly);
		}

		if (assessment.assignment) {
			assessmentDto.assignment = this.createAssignmentDto(assessment.assignment);
		}

		// If assessment belongs to a single student
		if (assessment.assessmentUserRelations?.length == 1) {
			assessmentDto.userId = assessment.assessmentUserRelations[0].userId;

			// If full user was included
			if (assessment.assessmentUserRelations[0].user) {
				const user = assessment.assessmentUserRelations[0].user;
				assessmentDto.participant = {
					userId: user.id,
					username: user.username,
					displayName: user.displayName,
					email: user.email,
					role: CourseRole.STUDENT
				};
			}
		}

		// If creator was loaded
		if (assessment.creator)
			assessmentDto.creator = this.createUserDto(assessment.creator, { removeEmail: true });
		if (assessment.lastUpdatedBy)
			assessmentDto.lastUpdatedBy = this.createUserDto(assessment.lastUpdatedBy, {
				removeEmail: true
			});

		if (assessment.group) {
			assessmentDto.group = this.createGroupDto(assessment.group);
			assessmentDto.group.members = assessment.assessmentUserRelations?.map(rel => {
				const participant: ParticipantDto = {
					// TODO: GroupId missing
					role: CourseRole.STUDENT,
					userId: rel.userId,
					username: rel.user.username,
					displayName: rel.user.displayName,
					email: rel.user.email
				};
				return participant;
			});
			assessmentDto.group.size = assessmentDto.group.members?.length;
		}

		return assessmentDto;
	}
}
