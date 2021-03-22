import { BadRequestException, Injectable } from "@nestjs/common";
import { EventBus } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DtoFactory } from "../../shared/dto-factory";
import { UserId } from "../../shared/entities/user.entity";
import { AssessmentEventDto } from "../dto/assessment/assessment-event.dto";
import { AssessmentFilter } from "../dto/assessment/assessment-filter.dto";
import {
	AssessmentCreateDto,
	AssessmentDto,
	AssessmentUpdateDto
} from "../dto/assessment/assessment.dto";
import { PartialAssessmentDto } from "../dto/assessment/partial-assessment.dto";
import { AssessmentEvent } from "../entities/assessment-event.entity";
import { Assessment } from "../entities/assessment.entity";
import { Assignment as AssignmentEntity, AssignmentId } from "../entities/assignment.entity";
import { AssessmentScoreChanged } from "../events/assessment/assessment-score-changed.event";
import { Assignment } from "../models/assignment.model";
import { Participant } from "../models/participant.model";
import { AssessmentRepository } from "../repositories/assessment.repository";
import { AssignmentRepository } from "../repositories/assignment.repository";
import { GroupService } from "./group.service";

@Injectable()
export class AssessmentService {
	constructor(
		@InjectRepository(Assessment) private assessmentRepository: AssessmentRepository,
		@InjectRepository(AssignmentEntity) private assignmentRepository: AssignmentRepository,
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

	async addPartialAssessment(
		assignmentId: AssignmentId,
		assessmentId: string,
		partial: PartialAssessmentDto
	): Promise<PartialAssessmentDto> {
		if (assessmentId != partial.assessmentId) {
			throw new BadRequestException("Partial assessment refers to a different assessment.");
		}

		const partialAssessment = await this.assessmentRepository.addPartialAssessment(partial);
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

		// Ensure that update only includes valid values
		this.validatePartialsForUpdate(update, assessmentId);

		const updated = await this.assessmentRepository.updateAssessment(
			assessmentId,
			update,
			updatedBy
		);

		// Store event, if achieved points changed
		if (original.achievedPoints !== updated.achievedPoints) {
			this.events.publish(
				new AssessmentScoreChanged(assessmentId, updatedBy, {
					oldScore: original.achievedPoints,
					newScore: updated.achievedPoints
				})
			);
		}

		return DtoFactory.createAssessmentDto(updated);
	}

	/**
	 * Ensures that `assessmentId` is correct (Throws `BadRequestException`).
	 * Ensures that no partial is included in multiple times (Throws `BadRequestException`).
	 * Ensures that `id` is undefined on new partials.
	 */
	private validatePartialsForUpdate(update: AssessmentUpdateDto, assessmentId: string): void {
		const set = new Set<number>();

		update.updatePartialAssignments?.forEach(partial => {
			this.throwErrorIfDifferentAssignmentId(assessmentId, partial);
			this.throwErrorIfPartialIncludedTwice(set, partial);
		});
		update.removePartialAssignments?.forEach(partial => {
			this.throwErrorIfDifferentAssignmentId(assessmentId, partial);
			this.throwErrorIfPartialIncludedTwice(set, partial);
		});

		update.addPartialAssessments?.forEach(partial => {
			this.throwErrorIfDifferentAssignmentId(assessmentId, partial);
			partial.id = undefined;
		});
	}

	private throwErrorIfDifferentAssignmentId(
		assessmentId: string,
		partial: PartialAssessmentDto
	): void {
		if (partial.assessmentId !== assessmentId) {
			throw new BadRequestException(
				"PartialAssessment must did not contain the correct assessmentId: " + assessmentId
			);
		}
	}

	private throwErrorIfPartialIncludedTwice(
		set: Set<number>,
		partial: PartialAssessmentDto
	): void {
		if (set.has(partial.id)) {
			throw new BadRequestException(
				`PartialAssessment (id: ${partial.id}) was included multiple times.`
			);
		} else {
			set.add(partial.id);
		}
	}

	async deleteAssessment(assessmentId: string): Promise<boolean> {
		return this.assessmentRepository.deleteAssessment(assessmentId);
	}
}
