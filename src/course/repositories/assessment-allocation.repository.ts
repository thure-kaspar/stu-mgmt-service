import { Repository, EntityRepository } from "typeorm";
import { AssessmentAllocation } from "../entities/assessment-allocation.entity";
import { AssessmentAllocationDto } from "../dto/assessment-allocation/assessment-allocation.dto";

@EntityRepository(AssessmentAllocation)
export class AssessmentAllocationRepository extends Repository<AssessmentAllocation> {

	/**
	 * Creates an AssessmentAllocation for an assignment.
	 * If the allocation already exists and currently maps to a different evaluator, updates the existing entity.
	 */
	async createAllocation(allocation: AssessmentAllocationDto): Promise<AssessmentAllocation> {
		// Where conditions checking, wether group/user is already assigned to a different evaluator
		let where: Partial<AssessmentAllocationDto> = {
			assignmentId: allocation.assignmentId
		};

		if (allocation.groupId) {
			where = { ...where, groupId: allocation.groupId };
		} else if (allocation.userId) {
			where = { ...where, userId: allocation.userId };
		}
		
		const existing = await this.getAllocation(where);

		// Update if it exists
		if (existing) {
			existing.assignedEvaluatorId = allocation.assignedEvaluatorId;
			return this.save(existing);
		} else {
			// Create a new allocation
			const allocationEntity = this.create(allocation);
			return this.save(allocationEntity);
		}
	}

	/**
	 * Creates multiple AssessmentAllocations at once.
	 */
	async createAllocations(allocations: AssessmentAllocationDto[]): Promise<AssessmentAllocation[]> {
		const allocationEntities = allocations.map(a => this.create(a));
		return this.save(allocationEntities);
	}

	/** Returns all AssessmentAllocations of a particular assignment. */
	async getAllocationsOfAssignment(assignmentId: string): Promise<AssessmentAllocation[]> {
		return this.find({
			where: {
				assignmentId: assignmentId
			}
		});
	}

	/**
	 * Tries to find an allocation with the given conditions.
	 * @returns The found allocation or undefined.
	 */
	async getAllocation(where: Partial<AssessmentAllocationDto>): Promise<AssessmentAllocation | undefined> {
		return this.findOne({ where: where });
	}

	/**
	 * Removes the given AssessmentAllocation.
	 * @param allocation The allocation that should be removed.
	 * @returns True, if allocation was deleted.
	 */
	async removeAllocation(allocation: Partial<AssessmentAllocationDto>): Promise<boolean> {
		let criteria: Partial<AssessmentAllocation> = {
			assignmentId: allocation.assignmentId
		};

		// Check, if allocation mapped group or single user
		if (allocation.groupId) {
			criteria = { ...criteria, groupId: allocation.groupId };
		} else if (allocation.userId) {
			criteria = { ...criteria, userId: allocation.userId };
		}

		const result = await this.delete(criteria);
		return result.affected == 1;
	}

}
