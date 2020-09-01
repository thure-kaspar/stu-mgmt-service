import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AssignmentDto } from "../course/dto/assignment/assignment.dto";
import { AdmissionCriteria } from "../course/entities/admission-criteria.entity";
import { AssignmentId } from "../course/entities/assignment.entity";
import { CourseId } from "../course/entities/course.entity";
import { Participant } from "../course/entities/participant.entity";
import { AdmissionCriteriaRepository } from "../course/repositories/admission-criteria.repository";
import { ParticipantRepository } from "../course/repositories/participant.repository";
import { AssignmentService } from "../course/services/assignment.service";
import { UserId } from "../shared/entities/user.entity";
import { AssignmentState } from "../shared/enums";
import { AdmissionStatusDto } from "./dto/admission-status.dto";
import { PointsOverviewDto, StudentResults } from "./dto/points-overview.dto";
import { AdmissionRule } from "./rules/abstract-rules";
import { AdmissionRuleFactory } from "./rules/factory";
import { AdmissionRuleDto } from "./dto/admission-rule.dto";

@Injectable() 
export class AdmissionStatusService {

	constructor(@InjectRepository(Participant) private participants: ParticipantRepository,
				@InjectRepository(AdmissionCriteria) private admissionCriteria: AdmissionCriteriaRepository,
				private assignmentService: AssignmentService) { }

	async getAdmissionStatusOfParticipants(courseId: CourseId): Promise<AdmissionStatusDto[]> {
		const [students, assignments, admissionCriteria] = await Promise.all([
			this.participants.getStudentsWithAssessments(courseId),
			this.assignmentService.getAssignments(courseId),
			this.admissionCriteria.getByCourseId(courseId)
		]);
			
		return this._getAdmissionStatusOfParticipants(courseId, assignments, admissionCriteria, students);
	}

	async getAdmissionStatusOfParticipant(courseId: CourseId, userId: UserId): Promise<AdmissionStatusDto> {
		const [student, assignments, admissionCriteria] = await Promise.all([
			this.participants.getStudentWithAssessments(courseId, userId),
			this.assignmentService.getAssignments(courseId),
			this.admissionCriteria.getByCourseId(courseId)
		]);

		const results = this._getAdmissionStatusOfParticipants(courseId, assignments, admissionCriteria, [student]);
		return results[0];
	}

	private _getAdmissionStatusOfParticipants(courseId: string, assignments: AssignmentDto[], admissionCriteria: AdmissionCriteria, students: Participant[]) {
		const evaluated = assignments.filter(a => a.state === AssignmentState.EVALUATED);
		const rules = admissionCriteria.admissionCriteria?.rules;

		if (this.courseHasNoAdmissionCriteria(rules)) {
			throw new BadRequestException(`Course (${courseId}) does not have admission criteria.`);
		}

		const criteria = rules.map(rule => AdmissionRuleFactory.create(rule, evaluated)); 
		return this.computeAdmissionStatusOfEachStudent(students, criteria);
	}
			
	private courseHasNoAdmissionCriteria(rules?: AdmissionRuleDto[]) {
		return !(rules?.length > 0);
	}

	private computeAdmissionStatusOfEachStudent(students: Participant[], criteria: AdmissionRule[]): AdmissionStatusDto[] {
		return students.map(student => this.computeAdmissionStatus(student, criteria));
	}
			
	private computeAdmissionStatus(student: Participant, criteria: AdmissionRule[]): AdmissionStatusDto {
		const assessments = student.user.assessmentUserRelations.map(aur => aur.assessment);
		const studentDto = student.toDto();
			
		const results = criteria.map(rule => rule.check(assessments));
		const hasAdmission = results.every(rule => rule.passed);
					
		return {
			participant: studentDto,
			hasAdmission,
			results,
		};
	}

	async getPointsOverview(courseId: CourseId): Promise<PointsOverviewDto> {
		const [students, assignments] = await Promise.all([
			this.participants.getStudentsWithAssessments(courseId),
			this.assignmentService.getAssignments(courseId),
		]);

		const evaluated = this.filterEvaluatedAssignments(assignments);

		const overview: PointsOverviewDto = {
			assignments: evaluated,
			results: students.map(student => this.getStudentResults(student, evaluated))
		};
		
		return overview;
	}

	async getPointsOverviewOfStudent(courseId: CourseId, userId: UserId): Promise<PointsOverviewDto> {
		const [student, assignments] = await Promise.all([
			this.participants.getStudentWithAssessments(courseId, userId),
			this.assignmentService.getAssignments(courseId),
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
			achievedPoints: assignments.map(assignment => achievedPointsMap.get(assignment.id) ?? 0)
		};
	}

	private mapAchievedPointsToAssignment(student: Participant): Map<AssignmentId, number> {
		const achievedPointsMap = new Map<AssignmentId, number>();
		student.user.assessmentUserRelations.forEach(aur => {
			achievedPointsMap.set(aur.assessment.assignmentId, aur.assessment.achievedPoints);
		});
		return achievedPointsMap;
	}

	private filterEvaluatedAssignments(assignments: AssignmentDto[]): AssignmentDto[] {
		return assignments.filter(a => a.state === AssignmentState.EVALUATED);
	}

}
