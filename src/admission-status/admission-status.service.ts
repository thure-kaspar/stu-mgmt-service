import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AssignmentDto } from "../course/dto/assignment/assignment.dto";
import { AdmissionCriteria } from "../course/entities/admission-criteria.entity";
import { AssignmentId } from "../course/entities/assignment.entity";
import { CourseId } from "../course/entities/course.entity";
import { Participant } from "../course/entities/participant.entity";
import { AdmissionCriteriaRepository } from "../course/repositories/admission-criteria.repository";
import { AdmissionFromPreviousSemesterRepository } from "../course/repositories/admission-from-previous-semester.repository";
import { ParticipantRepository } from "../course/repositories/participant.repository";
import { AssignmentService } from "../course/services/assignment.service";
import { UserId } from "../shared/entities/user.entity";
import { AssignmentState, isLecturer } from "../shared/enums";
import { AdmissionRuleDto } from "./dto/admission-rule.dto";
import { AdmissionStatusDto } from "./dto/admission-status.dto";
import { PointsOverviewDto, StudentResults } from "./dto/points-overview.dto";
import { AdmissionRule } from "./rules/abstract-rules";
import { AdmissionRuleFactory } from "./rules/factory";

@Injectable()
export class AdmissionStatusService {
	constructor(
		@InjectRepository(ParticipantRepository)
		private participants: ParticipantRepository,
		@InjectRepository(AdmissionCriteriaRepository)
		private admissionCriteria: AdmissionCriteriaRepository,
		@InjectRepository(AdmissionFromPreviousSemesterRepository)
		private admissionFromPreviousRepo: AdmissionFromPreviousSemesterRepository,
		private assignmentService: AssignmentService
	) {}

	async getAdmissionStatusOfParticipants(courseId: CourseId, isLecturer = false): Promise<AdmissionStatusDto[]> {
		const [students, assignments, admissionCriteria, admissionFromPrevious] = await Promise.all(
			[
				this.participants.getStudentsWithAssessments(courseId),
				this.assignmentService.getAssignments(courseId, isLecturer),
				this.admissionCriteria.getByCourseId(courseId),
				this.admissionFromPreviousRepo.tryGetByCourseId(courseId)
			]
		);

		return this._getAdmissionStatusOfParticipants(
			courseId,
			assignments,
			admissionCriteria,
			admissionFromPrevious?.toDto() ?? [],
			students
		);
	}

	async getAdmissionStatusOfParticipant(
		courseId: CourseId,
		userId: UserId,
		isLecturer = false
	): Promise<AdmissionStatusDto> {
		const [student, assignments, admissionCriteria, admissionFromPrevious] = await Promise.all([
			this.participants.getStudentWithAssessments(courseId, userId),
			this.assignmentService.getAssignments(courseId, isLecturer),
			this.admissionCriteria.getByCourseId(courseId),
			this.admissionFromPreviousRepo.tryGetByCourseId(courseId)
		]);

		const results = this._getAdmissionStatusOfParticipants(
			courseId,
			assignments,
			admissionCriteria,
			admissionFromPrevious?.toDto() ?? [],
			[student]
		);
		return results[0];
	}

	private _getAdmissionStatusOfParticipants(
		courseId: string,
		assignments: AssignmentDto[],
		admissionCriteria: AdmissionCriteria,
		admissionFromPreviousSemester: number[],
		students: Participant[]
	) {
		const evaluated = assignments.filter(a => a.state === AssignmentState.EVALUATED);
		const rules = admissionCriteria.admissionCriteria?.rules;

		if (this.courseHasNoAdmissionCriteria(rules)) {
			throw new BadRequestException(`Course (${courseId}) does not have admission criteria.`);
		}

		const criteria = rules.map(rule => AdmissionRuleFactory.create(rule, evaluated));
		return this.computeAdmissionStatusOfEachStudent(
			students,
			criteria,
			admissionFromPreviousSemester
		);
	}

	private courseHasNoAdmissionCriteria(rules?: AdmissionRuleDto[]) {
		return !(rules?.length > 0);
	}

	private computeAdmissionStatusOfEachStudent(
		students: Participant[],
		criteria: AdmissionRule[],
		admissionFromPreviousSemester: number[]
	): AdmissionStatusDto[] {
		const fromPreviousSemester = new Set(admissionFromPreviousSemester);
		return students.map(student =>
			this.computeAdmissionStatus(student, criteria, fromPreviousSemester)
		);
	}

	private computeAdmissionStatus(
		student: Participant,
		criteria: AdmissionRule[],
		fromPreviousSemester: Set<number>
	): AdmissionStatusDto {
		const assessments = student.user.assessmentUserRelations.map(aur => aur.assessment);
		const studentDto = student.toDto();

		const results = criteria.map(rule => rule.check(assessments));
		const fulfillsAdmissionCriteria = results.every(rule => rule.passed);
		const hasAdmissionFromPreviousSemester = fromPreviousSemester.has(studentDto.matrNr);

		return {
			participant: studentDto,
			hasAdmission: fulfillsAdmissionCriteria || hasAdmissionFromPreviousSemester,
			hasAdmissionFromPreviousSemester,
			fulfillsAdmissionCriteria,
			results
		};
	}

	async getPointsOverview(courseId: CourseId, isLecturer = false): Promise<PointsOverviewDto> {
		const [students, assignments] = await Promise.all([
			this.participants.getStudentsWithAssessments(courseId),
			this.assignmentService.getAssignments(courseId, isLecturer)
		]);

		const evaluated = this.filterEvaluatedAssignments(assignments);

		const overview: PointsOverviewDto = {
			assignments: evaluated,
			results: students.map(student => this.getStudentResults(student, evaluated))
		};

		return overview;
	}

	async getPointsOverviewOfStudent(
		courseId: CourseId,
		userId: UserId,
		isLecturer = false
	): Promise<PointsOverviewDto> {
		const [student, assignments] = await Promise.all([
			this.participants.getStudentWithAssessments(courseId, userId),
			this.assignmentService.getAssignments(courseId, isLecturer)
		]);

		const evaluated = this.filterEvaluatedAssignments(assignments);

		const overview: PointsOverviewDto = {
			assignments: evaluated,
			results: [this.getStudentResults(student, evaluated)]
		};

		return overview;
	}

	private getStudentResults(student: Participant, assignments: AssignmentDto[]): StudentResults {
		const achievedPointsMap = this.mapAchievedPointsToAssignment(student);

		return {
			student: student.toDto(),
			achievedPoints: assignments.map(
				assignment => achievedPointsMap.get(assignment.id)?.achievedPoints
			),
			assessmentIds: assignments.map(
				assignment => achievedPointsMap.get(assignment.id)?.assessmentId
			)
		};
	}

	private mapAchievedPointsToAssignment(
		student: Participant
	): Map<AssignmentId, { achievedPoints: number; assessmentId: string }> {
		const achievedPointsMap = new Map<
			AssignmentId,
			{ achievedPoints: number; assessmentId: string }
		>();
		student.user.assessmentUserRelations.forEach(aur => {
			achievedPointsMap.set(aur.assessment.assignmentId, {
				achievedPoints: aur.assessment.achievedPoints,
				assessmentId: aur.assessmentId
			});
		});
		return achievedPointsMap;
	}

	private filterEvaluatedAssignments(assignments: AssignmentDto[]): AssignmentDto[] {
		return assignments.filter(a => a.state === AssignmentState.EVALUATED);
	}
}
