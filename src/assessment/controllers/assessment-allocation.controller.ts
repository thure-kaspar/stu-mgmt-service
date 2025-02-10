import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { CourseId } from "../../course/entities/course.entity";
import { GroupId } from "../../course/entities/group.entity";
import { CourseMemberGuard } from "../../course/guards/course-member/course-member.guard";
import { TeachingStaffGuard } from "../../course/guards/teaching-staff.guard";
import { UserId } from "../../shared/entities/user.entity";
import { AssessmentAllocationDto } from "../dto/assessment-allocation.dto";
import { AssessmentAllocationService } from "../services/assessment-allocation.service";
import { Public } from "nest-keycloak-connect";
import { environment } from "src/.config/environment";

@ApiBearerAuth()
@ApiTags("assessment-allocation")
@Controller("courses/:courseId/assignments/:assignmentId/assessment-allocations")
@UseGuards(AuthGuard, CourseMemberGuard, TeachingStaffGuard)
@Public(environment.is("development", "demo", "testing"))
export class AssessmentAllocationController {
	constructor(private allocationService: AssessmentAllocationService) {}

	@Post()
	@ApiOperation({
		operationId: "createAllocation",
		summary: "Assign assessment to evaluator.",
		description:
			"Maps an evaluator to a group or user. If the group or user is already assigned to another evaluator, changes the evaluator."
	})
	createAllocation(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Body() allocation: AssessmentAllocationDto
	): Promise<AssessmentAllocationDto> {
		if (allocation.assignmentId !== assignmentId) {
			throw new BadRequestException("AssignmentId refers to a different assignment.");
		}

		return this.allocationService.createAllocation(allocation);
	}

	@Post("from-existing/:existingAssignmentId")
	@ApiOperation({
		operationId: "addAllocationsFromExistingAssignment",
		summary: "Copy assessment allocation from another assignment.",
		description: "Applies the allocations from another assignment to the specified assignment."
	})
	addAllocationsFromExistingAssignment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Param("existingAssignmentId") existingAssignmentId: string
	): Promise<AssessmentAllocationDto[]> {
		return this.allocationService.addAllocationsFromExistingAssignment(
			assignmentId,
			existingAssignmentId
		);
	}

	@Get()
	@ApiOperation({
		operationId: "getAllocations",
		summary: "Get assessment allocations.",
		description: "Returns a list of allocations, which map an evaluator to a group or user."
	})
	getAllocations(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string
	): Promise<AssessmentAllocationDto[]> {
		return this.allocationService.getAllocations(assignmentId);
	}

	@Delete()
	@ApiOperation({
		operationId: "removeAllocation",
		summary: "Remove allocation.",
		description:
			"Removes the assignment of the specified group or user. Throws error, if removal was unsuccessful."
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
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Query("groupId") groupId: GroupId,
		@Query("userId") userId: UserId
	): Promise<void> {
		const allocation: Partial<AssessmentAllocationDto> = {
			assignmentId: assignmentId,
			groupId: groupId,
			userId: userId
		};
		return this.allocationService.removeAllocation(allocation);
	}

	@Delete("all")
	removeAllAllocationsOfAssignment(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string
	): Promise<void> {
		return this.allocationService.removeAllAllocationsOfAssignment(assignmentId);
	}
}
