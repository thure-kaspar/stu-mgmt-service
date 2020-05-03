import { Injectable, BadRequestException } from "@nestjs/common";
import { AssessmentDto } from "../dto/assessment/assessment.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Assessment } from "../../shared/entities/assessment.entity";
import { AssessmentRepository } from "../database/repositories/assessment.repository";
import { GroupRepository } from "../database/repositories/group.repository";
import { Group } from "../../shared/entities/group.entity";
import { DtoFactory } from "../../shared/dto-factory";
import { PartialAssessmentDto } from "../dto/partial-assessment.dto";

@Injectable()
export class AssessmentService {

	constructor(@InjectRepository(Assessment) private assessmentRepository: AssessmentRepository,
				@InjectRepository(Group) private groupRepository: GroupRepository
	) { }

	async createAssessment(assignmentId: string, assessmentDto: AssessmentDto): Promise<AssessmentDto> {
		// assignmentId from the path must be equal to the dto's assignmentId
		if (assignmentId !== assessmentDto.assignmentId) {
			throw new BadRequestException("AssessmentDto refers to a different Assignment.");
		}

		let userIds: string[];
		// If assessment should apply to a group
		if (assessmentDto.groupId) {
			const group = await this.groupRepository.getGroupWithUsers(assessmentDto.groupId);
			userIds = group.userGroupRelations.map(x => x.userId);
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

	async addPartialAssessment(assessmentId: string, partial: PartialAssessmentDto): Promise<PartialAssessmentDto> {
		if (assessmentId != partial.assessmentId) {
			throw new BadRequestException("Partial assessment refers to a different assessment.");
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
