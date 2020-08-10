import { Controller, Get, Param, Post, UseGuards, Delete } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { UserId } from "../../shared/entities/user.entity";
import { GetCourse, GetSelectedParticipant } from "../decorators/decorators";
import { GroupDto } from "../dto/group/group.dto";
import { AssignmentId } from "../entities/assignment.entity";
import { CourseId } from "../entities/course.entity";
import { GroupId } from "../entities/group.entity";
import { CourseMemberGuard } from "../guards/course-member.guard";
import { Course } from "../models/course.model";
import { Participant } from "../models/participant.model";
import { AssignmentRegistrationService } from "../services/assignment-registration.service";
import { TeachingStaffGuard } from "../guards/teaching-staff.guard";

@ApiBearerAuth()
@ApiTags("assignment-registration")
@UseGuards(AuthGuard(), CourseMemberGuard)
@Controller("courses/:courseId/assignments/:assignmentId/registrations")
export class AssignmentRegistrationController {

	constructor(private registrations: AssignmentRegistrationService) { }

	@ApiOperation({
		operationId: "_registerAllGroups",
		summary: "Registers all groups.",
		description: "Registers all groups with their current members for the assignment. Should only be used for testing or when automatic registration fails."
	})
	@Post()
	@UseGuards(TeachingStaffGuard)
	_registerAllGroups(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: AssignmentId, 
	): Promise<void> {

		return this.registrations.registerGroupsForAssignment(courseId, assignmentId);
	}

	@ApiOperation({
		operationId: "registerParticipantAsGroupMember",
		summary: "Register participant as group member.",
		description: "Registers a participant as a member of the specified group for the assignment."
	})
	@Post("groups/:groupId/members/:userId")
	@UseGuards(TeachingStaffGuard)
	registerParticipantAsGroupMember(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: AssignmentId,
		@Param("groupId") groupId: GroupId,
		@Param("userId") userId: UserId,
		@GetCourse() course: Course,
		@GetSelectedParticipant() selectedParticipant: Participant
	): Promise<void> {

		return this.registrations.registerUserToGroup(course, assignmentId, groupId, selectedParticipant);
	}

	@ApiOperation({
		operationId: "getRegisteredGroups",
		summary: "Get registered groups.",
		description: "Retrieves all registered groups and their members for the specified assignment."
	})
	@Get("groups")
	getRegisteredGroups(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: AssignmentId,
	): Promise<GroupDto[]> {

		return this.registrations.getRegisteredGroupsWithMembers(assignmentId);
	}

	@ApiOperation({
		operationId: "getRegisteredGroup",
		summary: "Get registered group.",
		description: "Retrieves all registered groups and their members for the specified assignment."
	})
	@Get("groups/:groupId")
	getRegisteredGroup(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: AssignmentId,
		@Param("groupId") groupId: GroupId
	): Promise<GroupDto> {

		return this.registrations.getRegisteredGroupWithMembers(assignmentId, groupId);
	}

	@ApiOperation({
		operationId: "getRegisteredGroupOfUser",
		summary: "Get registered group of user.",
		description: "Retrieves the group that the participant is registered with for the specified assignment."
	})
	@Get("users/:userId")
	getRegisteredGroupOfUser(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: AssignmentId,
		@Param("userId") userId: UserId
	): Promise<GroupDto> {

		return this.registrations.getRegisteredGroupOfUser(assignmentId, userId);
	}

	@ApiOperation({
		operationId: "unregisterGroup",
		summary: "Unregister group.",
		description: "Removes the registration of a group and its members for this assignment."
	})
	@UseGuards(TeachingStaffGuard)
	@Delete("groups/:groupId")
	unregisterGroup(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: AssignmentId,
		@Param("groupId") groupId: GroupId
	): Promise<void> {

		return this.registrations.unregisterGroup(courseId, assignmentId, groupId);
	}

	@ApiOperation({
		operationId: "unregisterUser",
		summary: "Unregister user.",
		description: "Removes the registration of a user for the specified assignment."
	})
	@UseGuards(TeachingStaffGuard)
	@Delete("users/:userId")
	unregisterUser(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: AssignmentId,
		@Param("userId") userId: UserId
	): Promise<void> {

		return this.registrations.unregisterUser(courseId, assignmentId, userId);
	}

	@ApiOperation({
		operationId: "unregisterAll",
		summary: "Unregister all.",
		description: "Removes all registrations for the specified assignment."
	})
	@UseGuards(TeachingStaffGuard)
	@Delete()
	unregisterAll(
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: AssignmentId,
	): Promise<void> {

		return this.registrations.removeAllRegistrations(assignmentId);
	}

}
