import { Injectable, BadRequestException } from "@nestjs/common";
import { AssessmentDto } from "../../shared/dto/assessment.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Assessment } from "../../shared/entities/assessment.entity";
import { AssessmentRepository } from "../repositories/assessment.repository";
import * as fromDtoFactoy from "../../shared/dto-factory";
import { Assignment } from "../../shared/entities/assignment.entity";
import { AssignmentRepository } from "../repositories/assignment.repository";

@Injectable()
export class AssessmentService {

	constructor(@InjectRepository(Assessment) private assessmentRepository: AssessmentRepository,
				@InjectRepository(Assignment) private assignmentRepository: AssignmentRepository) { }

	async createAssessment(assignmentId: string, assessmentDto: AssessmentDto): Promise<AssessmentDto> {
		// assignmentId from the path must be equal to the dto's assignmentId
		if (assignmentId !== assessmentDto.assignmentId) {
			throw new BadRequestException("AssessmentDto refers to the wrong different Assignment.");
		}

		const createdAssessment = await this.assessmentRepository.createAssessment(assessmentDto);
		const createdAssessmentDto = fromDtoFactoy.createAssessmentDto(createdAssessment);

		return createdAssessmentDto;
	}

	async getAssessmentsForAssignment(assignmentId: string): Promise<AssessmentDto[]> {
		const assessments = await this.assessmentRepository.getAssessmentsForAssignment(assignmentId);
		const assessmentDtos: AssessmentDto[] = [];
		assessments.forEach(assessment => {
			assessmentDtos.push(fromDtoFactoy.createAssessmentDto(assessment));
		});
		return assessmentDtos;
	}

}