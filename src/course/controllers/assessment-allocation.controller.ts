import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { Controller, Param, Post, Body, Delete, BadRequestException, Query, Get } from "@nestjs/common";
import { AssessmentAllocationDto } from "../dto/assessment-allocation/assessment-allocation.dto";
import { AssessmentAllocationService } from "../services/assessment-allocation.service";

@ApiTags("assessment-allocation")
@Controller("courses/:courseId/assignments/:assignmentId/assessment-allocations")
export class AssessmentAllocationController {

	constructor(private allocationService: AssessmentAllocationService) { }

	@Post()
	@ApiOperation({
		operationId: "createAllocation",
		summary: "Assign assessment to evaluator",
		description: "Maps an evaluator to a group or user. If the group or user is already assigned to another evaluator, changes the evaluator."
	})
	createAllocation(
		@Param("assignmentId") assignmentId: string,
		@Body() allocation: AssessmentAllocationDto
	): Promise<AssessmentAllocationDto> {
		if (allocation.assignmentId !== assignmentId) {
			throw new BadRequestException("AssignmentId refers to a different assignment.");
		}

		return this.allocationService.createAllocation(allocation);
	}

	@Get()
	@ApiOperation({
		operationId: "getAllocations",
		summary: "Get assessment allocations",
		description: "Returns a list of allocations, which map an evaluator to a group or user."
	})
	getAllocations(@Param("assignmentId") assignmentId: string): Promise<AssessmentAllocationDto[]> {
		return this.allocationService.getAllocations(assignmentId);
	}

	@Delete()
	@ApiOperation({
		operationId: "removeAllocation",
		summary: "Remove allocation",
		description: "Removes the assignment of the specified group or user. Throws error, if removal was unsuccessful."
	})
	@ApiQuery({
		name: "groupId",
		required: false,
		type: String,
		description: "Query must specify either groupId or userId."
	})
	@ApiQuery({
		name: "userId",
		required: false,
		type: String,
		description: "Query must specify either groupId or userId."
	})
	removeAllocation(
		@Param("assignmentId") assignmentId: string,
		@Query("groupId") groupId: string,
		@Query("userId") userId: string,
	): Promise<void> {
		const allocation: Partial<AssessmentAllocationDto> = {
			assignmentId: assignmentId,
			groupId: groupId,
			userId: userId
		};
		return this.allocationService.removeAllocation(allocation);
	}

}
