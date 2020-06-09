import { Injectable, BadRequestException } from "@nestjs/common";
import { AssignmentDto } from "../dto/assignment/assignment.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Assignment } from "../entities/assignment.entity";
import { AssignmentRepository } from "../repositories/assignment.repository";
import { DtoFactory } from "../../shared/dto-factory";

@Injectable()
export class AssignmentService {

	constructor(@InjectRepository(Assignment) private assignmentRepository: AssignmentRepository) { }

	async createAssignment(courseId: string, assignmentDto: AssignmentDto): Promise<AssignmentDto> {
		if (courseId !== assignmentDto.courseId) {
			throw new BadRequestException("CourseId refers to a different course");
		}
		const createdAssignment = await this.assignmentRepository.createAssignment(assignmentDto);
		return DtoFactory.createAssignmentDto(createdAssignment);
	}

	async getAssignments(courseId: string): Promise<AssignmentDto[]> {
		const assignments = await this.assignmentRepository.getAssignments(courseId);
		const assignmentDtos = assignments.map(a => DtoFactory.createAssignmentDto(a));
		return assignmentDtos;
	}

	async getAssignmentById(assignmentId: string): Promise<AssignmentDto> {
		const assignment = await this.assignmentRepository.getAssignmentById(assignmentId);
		return DtoFactory.createAssignmentDto(assignment);
	}

	async updateAssignment(assignmentId: string, assignmentDto: AssignmentDto): Promise<AssignmentDto> {
		if (assignmentId !== assignmentDto.id) {
			throw new BadRequestException("AssignmentId refers to a different assignment.");
		}
		const assignment = await this.assignmentRepository.updateAssignment(assignmentId, assignmentDto);
		return DtoFactory.createAssignmentDto(assignment);
	}

	async deleteAssignment(assignmentId: string): Promise<boolean> {
		return this.assignmentRepository.deleteAssignment(assignmentId);
	}

}
