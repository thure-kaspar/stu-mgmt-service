import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In } from "typeorm";
import { ActivityDto } from "../activity/activity.dto";
import { ActivityService } from "../activity/activity.service";
import { AdmissionStatusService } from "../admission-status/admission-status.service";
import { AdmissionStatusDto } from "../admission-status/dto/admission-status.dto";
import { AssessmentDto } from "../assessment/dto/assessment.dto";
import { Assessment } from "../assessment/entities/assessment.entity";
import { AssessmentRepository } from "../assessment/repositories/assessment.repository";
import { AssignmentDto } from "../course/dto/assignment/assignment.dto";
import { ParticipantDto } from "../course/dto/course-participant/participant.dto";
import { CourseDto } from "../course/dto/course/course.dto";
import { GroupDto } from "../course/dto/group/group.dto";
import { AssignmentRegistrationService } from "../course/services/assignment-registration.service";
import { AssignmentService } from "../course/services/assignment.service";
import { CourseParticipantsService } from "../course/services/course-participants.service";
import { CourseService } from "../course/services/course.service";
import { GroupService } from "../course/services/group.service";
import { AssignmentType, CourseRole } from "../shared/enums";
import { SubmissionService } from "../submission/submission.service";

type StudentData = {
	userInfo: {
		userId: string;
		username: string;
		displayName: string;
		matrNr: number;
	};
	activity: Date[];
	submissions: { assignmentId: string; date: Date }[];
	admissionStatus: AdmissionStatusDto;
	grades: {
		[assignmentId: string]: {
			assessmentId: string;
			assignmentType: AssignmentType;
			achievedPointsInPercent: number;
			group?: GroupDto;
		};
	};
};

type RecommenderExport = {
	students: StudentData[];
	groups: GroupDto[];
	assignments: AssignmentDto[];
	groupsForAssignment: {
		[assignmentId: string]: GroupDto[];
	};
	course: CourseDto;
};

type RawData = {
	course: CourseDto;
	students: ParticipantDto[];
	assignments: AssignmentDto[];
	assessments: AssessmentDto[];
	groups: GroupDto[];
	groupsForAssignment: {
		[assignmentId: string]: GroupDto[];
	};
	activity: ActivityDto[];
	submissions: SubmissionData[];
	admissionStatus: AdmissionStatusDto[];
};

type SubmissionData = { assignmentId: string; userId: string; date: Date };

@Injectable()
export class RecommenderExportService {
	constructor(
		private courseService: CourseService,
		private assignmentService: AssignmentService,
		private participantsService: CourseParticipantsService,
		@InjectRepository(AssessmentRepository) private assessmentsRepository: AssessmentRepository,
		private groupService: GroupService,
		private activityService: ActivityService,
		private registrations: AssignmentRegistrationService,
		private submissions: SubmissionService,
		private admissionStatusService: AdmissionStatusService
	) {}

	async getRecommenderExportData(courseId: string): Promise<RecommenderExport> {
		if (!courseId) {
			throw new BadRequestException("courseId must be defined.");
		}

		const rawData = await this._getRawData(courseId);
		const exportData = this._mapRawData(rawData);

		return exportData;
	}

	async _getRawData(courseId: string): Promise<RawData> {
		const [
			course,
			[students],
			assignments,
			[groups],
			activity,
			[submissions],
			admissionStatus
		] = await Promise.all([
			this.courseService.getCourseById(courseId),
			this.participantsService.getParticipants(courseId, {
				courseRole: [CourseRole.STUDENT]
			}),
			this.assignmentService.getAssignments(courseId, true),
			this.groupService.getGroupsOfCourse(courseId),
			this.activityService.getActivityData(courseId),
			this.submissions.getAllSubmissions(courseId),
			this.admissionStatusService.getAdmissionStatusOfParticipants(courseId, true)
		]);

		const assessments = await this._getAssessmentForAssignments(assignments.map(a => a.id));

		const groupsForAssignment = {};
		for (const assignment of assignments) {
			const [groups] = await this.registrations.getRegisteredGroupsWithMembers(assignment.id);
			groupsForAssignment[assignment.id] = groups;
		}

		return {
			course,
			students,
			assignments,
			assessments,
			groups,
			groupsForAssignment,
			activity,
			submissions,
			admissionStatus
		};
	}

	_mapRawData(rawData: RawData): RecommenderExport {
		const assignmentMap = this.mapAssignmentsToId(rawData.assignments);
		const studentMap = this.createStudentsMap(rawData.students);

		this.addSubmissionsToStudents(rawData.submissions, studentMap);
		this.addAssessmentsToStudents(rawData.assessments, assignmentMap, studentMap);
		this.addActivityToStudents(rawData.activity, studentMap);
		this.addAdmissionStatusToStudents(rawData.admissionStatus, studentMap);

		return {
			course: rawData.course,
			groups: rawData.groups,
			assignments: rawData.assignments,
			groupsForAssignment: rawData.groupsForAssignment,
			students: Array.from(studentMap.values())
		};
	}

	private addAdmissionStatusToStudents(
		admissionStatus: AdmissionStatusDto[],
		studentMap: Map<string, StudentData>
	): void {
		for (const status of admissionStatus) {
			const student = studentMap.get(status.participant.userId);

			status.participant = undefined;

			if (student) {
				student.admissionStatus = status;
			}
		}
	}

	private addActivityToStudents(
		activity: ActivityDto[],
		studentMap: Map<string, StudentData>
	): void {
		for (const act of activity) {
			const student = studentMap.get(act.user.userId);

			if (student) {
				student.activity = act.dates;
			}
		}
	}

	private addAssessmentsToStudents(
		assessments: AssessmentDto[],
		assignmentMap: Map<string, AssignmentDto>,
		studentMap: Map<string, StudentData>
	): void {
		for (const assessment of assessments) {
			const assignment = assignmentMap.get(assessment.assignmentId);
			let achievedPointsInPercent: number | undefined = undefined;

			if (isFinite(assessment.achievedPoints) && isFinite(assignment.points)) {
				achievedPointsInPercent = (assessment.achievedPoints / assignment.points) * 100;
			}

			if (assessment.group) {
				assessment.group.members.forEach(member => {
					const student = studentMap.get(member.userId);
					if (student) {
						student.grades[assessment.assignmentId] = {
							assessmentId: assessment.id,
							assignmentType: assignment.type,
							group: assessment.group,
							achievedPointsInPercent
						};
					}
				});
			} else if (assessment.participant) {
				const student = studentMap.get(assessment.participant.userId);
				if (student) {
					student.grades[assessment.assignmentId] = {
						assessmentId: assessment.id,
						assignmentType: assignment.type,
						achievedPointsInPercent
					};
				}
			}
		}
	}

	private addSubmissionsToStudents(
		submissions: SubmissionData[],
		studentMap: Map<string, StudentData>
	): void {
		for (const submission of submissions) {
			studentMap.get(submission.userId)?.submissions.push({
				date: submission.date,
				assignmentId: submission.assignmentId
			});
		}
	}

	private createStudentsMap(students: ParticipantDto[]): Map<string, StudentData> {
		const studentMap = new Map<string, StudentData>();
		for (const student of students) {
			studentMap.set(student.userId, {
				userInfo: {
					userId: student.userId,
					displayName: student.displayName,
					username: student.username,
					matrNr: student.matrNr
				},
				activity: [],
				submissions: [],
				grades: {},
				admissionStatus: null
			});
		}
		return studentMap;
	}

	private mapAssignmentsToId(assignments: AssignmentDto[]): Map<string, AssignmentDto> {
		const assignmentMap = new Map<string, AssignmentDto>();
		for (const assignment of assignments) {
			assignmentMap.set(assignment.id, assignment);
		}
		return assignmentMap;
	}

	async _getAssessmentForAssignments(assignmentIds: string[]): Promise<Assessment[]> {
		const assessments = await this.assessmentsRepository.find({
			where: {
				assignmentId: In(assignmentIds)
			},
			relations: ["assessmentUserRelations"]
		});
		return assessments;
	}
}
