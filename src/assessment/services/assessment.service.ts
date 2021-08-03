import { BadRequestException, Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AssignmentId } from "../../course/entities/assignment.entity";
import { Assignment } from "../../course/models/assignment.model";
import { Participant } from "../../course/models/participant.model";
import { AssignmentRepository } from "../../course/repositories/assignment.repository";
import { GroupService } from "../../course/services/group.service";
import { DtoFactory } from "../../shared/dto-factory";
import { UserId } from "../../shared/entities/user.entity";
import { AssignmentState } from "../../shared/enums";
import { AssessmentEventDto } from "../dto/assessment-event.dto";
import { AssessmentFilter } from "../dto/assessment-filter.dto";
import { AssessmentCreateDto, AssessmentDto, AssessmentUpdateDto } from "../dto/assessment.dto";
import { PartialAssessmentDto } from "../dto/partial-assessment.dto";
import { AssessmentEvent } from "../entities/assessment-event.entity";
import { Assessment } from "../entities/assessment.entity";
import { AssessmentScoreChanged } from "../events/assessment-score-changed.event";
import { AssessmentRepository } from "../repositories/assessment.repository";

@Injectable()
export class AssessmentService {
	constructor(
		@InjectRepository(AssessmentRepository) private assessmentRepository: AssessmentRepository,
		@InjectRepository(AssignmentRepository) private assignmentRepository: AssignmentRepository,
		@InjectRepository(AssessmentEvent)
		private assessmentEventsRepo: Repository<AssessmentEvent>,
		private groupService: GroupService,
		private events: EventBus
	) {}

	/**
	 * Creates a new assessment and returns it.
	 */
	async createAssessment(
		participant: Participant,
		assignment: Assignment,
		assessmentDto: AssessmentCreateDto
	): Promise<AssessmentDto> {
		this.validateAssessment(assessmentDto, assignment);
		const userIds = await this.getUserIdsOfReviewedParticipants(assessmentDto, assignment);
		const createdAssessment = await this.assessmentRepository.createAssessment(
			assessmentDto,
			userIds,
			participant.userId
		);
		return DtoFactory.createAssessmentDto(createdAssessment);
	}

	/**
	 * Validates the assessment.
	 * Throws appropriate exceptions, if the assessment is invalid.
	 * @throws `BadRequestException`
	 */
	private validateAssessment(assessmentDto: AssessmentCreateDto, assignment: Assignment) {
		const achievablePoints = assignment.points + (assignment.bonusPoints ?? 0);
		if (assessmentDto.achievedPoints > achievablePoints) {
			throw new BadRequestException(
				`Assignment (${assignment.id}) can only award up to ${achievablePoints} points (Given: ${assessmentDto.achievedPoints}).`
			);
		}
	}

	/**
	 * Returns the userIds of participants targeted by the assessment.
	 * @throws `BadRequestException` if assessment did not specify a target.
	 */
	private async getUserIdsOfReviewedParticipants(
		assessmentDto: AssessmentCreateDto,
		assignment: Assignment
	) {
		let userIds: string[] = [];
		// If assessment should apply to a group
		if (assessmentDto.groupId) {
			// Get ids of members that were in this group for the assignment
			const group = await this.groupService.getGroupFromAssignment(
				assessmentDto.groupId,
				assignment.id
			);
			userIds = group.members.map(x => x.userId);
			// If assessment should apply to single user
		} else if (assessmentDto.userId) {
			userIds = [assessmentDto.userId];
			// If neither (group or user) has been specified
		} else {
			throw new BadRequestException("Assessment did not specify the evaluated group or user");
		}
		return userIds;
	}

	async setPartialAssessment(
		assessmentId: string,
		partialAssessmentDto: PartialAssessmentDto
	): Promise<PartialAssessmentDto> {
		const partialAssessment = await this.assessmentRepository.addOrUpdatePartialAssessment(
			assessmentId,
			partialAssessmentDto
		);
		return partialAssessment.toDto();
	}

	/**
	 * Returns all assessments that match the specified filter.
	 */
	async getAssessmentsForAssignment(
		assignmentId: AssignmentId,
		filter?: AssessmentFilter
	): Promise<[AssessmentDto[], number]> {
		const [assessments, count] = await this.assessmentRepository.getAssessmentsForAssignment(
			assignmentId,
			filter
		);
		const dtos = assessments.map(assessment => DtoFactory.createAssessmentDto(assessment));
		return [dtos, count];
	}

	async getAssessmentById(assessmentId: string): Promise<AssessmentDto> {
		const assessment = await this.assessmentRepository.getAssessmentById(assessmentId);
		return DtoFactory.createAssessmentDto(assessment);
	}

	/**
	 * Returns events that have a relation with the specified assessment (i.e. `AssessmentScoreChangedEvent`).
	 */
	async getEventsOfAssessment(assessmentId: string): Promise<AssessmentEventDto[]> {
		const assessmentEvents = await this.assessmentEventsRepo.find({
			where: {
				assessmentId
			},
			order: {
				timestamp: "ASC"
			}
		});
		return assessmentEvents.map(event => event.toDto());
	}

	/**
	 * Updates the assessment including its partial assessments. Triggers `AssessmentScoreChangedEvent`, if the score changed.
	 * @param assessmentId Id of the assessment.
	 * @param assessmentDto The updated assessment including all partial assessments.
	 * @param updatedBy UserId of the user, who triggered the update.
	 * @returns Updated assessment.
	 */
	async updateAssessment(
		assessmentId: string,
		update: AssessmentUpdateDto,
		updatedBy: UserId
	): Promise<AssessmentDto> {
		const original = await this.assessmentRepository.getAssessmentById(assessmentId);

		const updated = await this.assessmentRepository.updateAssessment(
			assessmentId,
			update,
			updatedBy
		);

		if (this.scoreChangedAfterRelease(original, updated)) {
			this.events.publish(
				new AssessmentScoreChanged(assessmentId, updatedBy, {
					oldScore: original.achievedPoints,
					newScore: updated.achievedPoints
				})
			);
		}

		return DtoFactory.createAssessmentDto(updated);
	}

	private scoreChangedAfterRelease(original: Assessment, updated: Assessment) {
		return (
			original.achievedPoints !== updated.achievedPoints &&
			updated.assignment.state === AssignmentState.EVALUATED
		);
	}

	async deleteAssessment(assessmentId: string): Promise<boolean> {
		return this.assessmentRepository.deleteAssessment(assessmentId);
	}
}
