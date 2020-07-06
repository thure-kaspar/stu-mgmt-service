import { Injectable, BadRequestException } from "@nestjs/common";
import { AssessmentDto, AssessmentCreateDto } from "../dto/assessment/assessment.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Assessment } from "../entities/assessment.entity";
import { AssessmentRepository } from "../repositories/assessment.repository";
import { DtoFactory } from "../../shared/dto-factory";
import { PartialAssessmentDto } from "../dto/assessment/partial-assessment.dto";
import { AssignmentRepository } from "../repositories/assignment.repository";
import { Assignment } from "../entities/assignment.entity";
import { AssignmentState } from "../../shared/enums";
import { GroupService } from "./group.service";

@Injectable()
export class AssessmentService {

	constructor(@InjectRepository(Assessment) private assessmentRepository: AssessmentRepository,
				@InjectRepository(Assignment) private assignmentRepository: AssignmentRepository,
				private groupService: GroupService,
	) { }

	async createAssessment(assignmentId: string, assessmentDto: AssessmentCreateDto): Promise<AssessmentDto> {
		// assignmentId from the path must be equal to the dto's assignmentId
		if (assignmentId !== assessmentDto.assignmentId) {
			throw new BadRequestException("AssessmentDto refers to a different Assignment.");
		}

		let userIds: string[];
		// If assessment should apply to a group
		if (assessmentDto.groupId) {
			// Get ids of members that were in this group for the assignment
			const group = await this.groupService.getGroupFromAssignment(assessmentDto.groupId, assignmentId);
			userIds = group.users.map(x => x.id);
		// If assessment should apply to single user
		} else if (assessmentDto.userId) {
			userIds = [assessmentDto.userId];
		// If neither (group or user) has been specified
		} else {
			throw new BadRequestException("Assessment did not specify the evaluated group or user");
		}

		const createdAssessment = await this.assessmentRepository.createAssessment(assessmentDto, userIds);
		return DtoFactory.createAssessmentDto(createdAssessment);
	}

	async addPartialAssessment(assignmentId: string, assessmentId: string, partial: PartialAssessmentDto): Promise<PartialAssessmentDto> {
		if (assessmentId != partial.assessmentId) {
			throw new BadRequestException("Partial assessment refers to a different assessment.");
		}

		const assignment = await this.assignmentRepository.getAssignmentById(assignmentId);
		if (assignment.state !== AssignmentState.IN_REVIEW) {
			throw new BadRequestException("Assignment is not in the required state (IN_REVIEW).");
		}

		const partialAssessment = await this.assessmentRepository.addPartialAssessment(partial);
		return partialAssessment.toDto();
	}

	async getAssessmentsForAssignment(assignmentId: string): Promise<AssessmentDto[]> {
		const assessments = await this.assessmentRepository.getAllAssessmentsForAssignment(assignmentId);
		return assessments.map(assessment => DtoFactory.createAssessmentDto(assessment));
	}

	async getAssessmentById(assessmentId: string): Promise<AssessmentDto> {
		const assessment = await this.assessmentRepository.getAssessmentById(assessmentId);
		return DtoFactory.createAssessmentDto(assessment);
	}

	async updateAssessment(assessmentId: string, assessmentDto: AssessmentDto): Promise<AssessmentDto> {
		if (assessmentId !== assessmentDto.id) {
			throw new BadRequestException("AssessmentId refers to a different assessment.");
		}
		const assessment = await this.assessmentRepository.updateAssessment(assessmentId, assessmentDto);
		return DtoFactory.createAssessmentDto(assessment);
	}

	async deleteAssessment(assessmentId: string): Promise<boolean> {
		return this.assessmentRepository.deleteAssessment(assessmentId);
	}

}
