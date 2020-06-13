import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AssessmentAllocation } from "../entities/assessment-allocation.entity";
import { AssessmentAllocationRepository } from "../repositories/assessment-allocation.repository";
import { AssessmentAllocationDto } from "../dto/assessment-allocation/assessment-allocation.dto";

@Injectable()
export class AssessmentAllocationService {

	constructor(@InjectRepository(AssessmentAllocation) private allocationRepo: AssessmentAllocationRepository) { }

	/**
	 * Creates an allocation and returns it.
	 */
	async createAllocation(allocation: AssessmentAllocationDto): Promise<AssessmentAllocationDto> {
		return (await this.allocationRepo.createAllocation(allocation)).toDto();
	}

	/**
	 * Add allocations from an existing assignment to a new assignment.
	 * @param newAssignmentId Id of the new assignment, for which the allocations should be created.
	 * @param existingAssignmentId Id of an existing assignment, whose allocations should be reused.
	 */
	async addAllocationsFromExistingAssignment(newAssignmentId: string, existingAssignmentId: string): Promise<AssessmentAllocationDto[]> {
		// Get allocations from existing assignment
		const allocations = await this.allocationRepo.getAllocationsOfAssignment(existingAssignmentId);

		if (allocations.length == 0) {
			return []; // Return empty array, if no allocations exist
		}

		// Change to new assignment
		allocations.forEach(a => a.assignmentId = newAssignmentId);

		// Create allocations
		const createdAllocations = await this.allocationRepo.createAllocations(allocations);
		return createdAllocations.map(a => a.toDto());
	}

	/**
	 * Returns all allocations of a particular assignment.
	 */
	async getAllocations(assignmentId: string): Promise<AssessmentAllocationDto[]> {
		const allocations = await this.allocationRepo.getAllocationsOfAssignment(assignmentId);
		return allocations.map(a => a.toDto());
	}

	/**
	 * Removes the allocation.
	 * @param allocation Must contain the groupId or userId and assignmentId.
	 * @returns Throws BadRequestException, if removal failed.
	 */
	async removeAllocation(allocation: Partial<AssessmentAllocationDto>): Promise<void> {
		const removed = await this.allocationRepo.removeAllocation(allocation);
		if (!removed) {
			throw new BadRequestException("Failed to delete the AssessmentAllocation.");
		}
	}

}
