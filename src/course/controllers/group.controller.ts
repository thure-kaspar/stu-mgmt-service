import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { setTotalCountHeader } from "../../../test/utils/http-utils";
import { PasswordDto } from "../../shared/dto/password.dto";
import { PaginatedResult, throwIfRequestFailed } from "../../utils/http-utils";
import { ParticipantDto } from "../dto/course-participant/participant.dto";
import { GroupCreateBulkDto } from "../dto/group/group-create-bulk.dto";
import { GroupEventDto } from "../dto/group/group-event.dto";
import { GroupFilter } from "../dto/group/group-filter.dto";
import { GroupDto, GroupUpdateDto } from "../dto/group/group.dto";
import { CourseId } from "../entities/course.entity";
import { CourseMemberGuard } from "../guards/course-member.guard";
import { AssignedEvaluatorFilter, GroupWithAssignedEvaluatorDto } from "../queries/groups-with-assigned-evaluator/group-with-assigned-evaluator.dto";
import { GroupsWithAssignedEvaluatorQuery } from "../queries/groups-with-assigned-evaluator/groups-with-assigned-evaluator.query";
import { GroupService } from "../services/group.service";
import { Course } from "../models/course.model";
import { Participant } from "../models/participant.model";
import { GetGroup, GetCourse, GetParticipant, GetSelectedParticipant } from "../decorators/decorators";
import { Group } from "../models/group.model";
import { GroupGuard } from "../guards/group.guard";
import { SelectedParticipantGuard } from "../guards/selected-participant.guard";
import { GroupId } from "../entities/group.entity";
import { UserId } from "../../shared/entities/user.entity";

@ApiBearerAuth()
@ApiTags("groups")
@UseGuards(AuthGuard(), CourseMemberGuard)
@Controller("courses/:courseId/groups")
export class GroupController {
	constructor(private groupService: GroupService,
				private queryBus: QueryBus) { }

	@Post()
	@ApiOperation({
		operationId: "createGroup",
		summary: "Create group.",
		description: "Creates a new group, if course allows group creation. If request was triggered by student, student is automatically joining the group."
	})
	createGroup(
		@Param("courseId") courseId: CourseId,
		@GetCourse() course: Course, 
		@GetParticipant() participant: Participant,
		@Body() groupDto: GroupDto,
	): Promise<GroupDto> {

		return this.groupService.createGroup(course, participant, groupDto);
	}

	@Post("bulk")
	@ApiOperation({
		operationId: "createMultipleGroups",
		summary: "Create multiple groups.",
		description: "Creates multiple groups with the given names or naming schema and count."
	})
	createMultipleGroups(
		@Param("courseId") courseId: CourseId,
		@Body() groupCreateBulk: GroupCreateBulkDto 
	): Promise<GroupDto[]> {

		return this.groupService.createMultipleGroups(courseId, groupCreateBulk);
	}
	
	@ApiOperation({
		operationId: "addUserToGroup",
		summary: "Add user to group.",
		description: "Adds the user to the group, if constraints are fulfilled."
	})
	@Post(":groupId/users/:userId")
	@UseGuards(SelectedParticipantGuard, GroupGuard)
	addUserToGroup(
		@Param("courseId") courseId: CourseId,
		@Param("groupId") groupId: GroupId,
		@Param("userId") userId: UserId,
		@GetCourse() course: Course,
		@GetGroup() group: Group,
		@GetParticipant() participant: Participant,
		@GetSelectedParticipant() selectedParticipant: Participant,
		@Body() password?: PasswordDto,
	): Promise<any> {

		return this.groupService.addUserToGroup(course, group, participant, selectedParticipant, password.password);
	}

	@Get()
	@ApiOperation({
		operationId: "getGroupsOfCourse",
		summary: "Get groups of course.",
		description: "Retrieves all groups that belong to the course."
	})
	getGroupsOfCourse(
		@Req() request: Request,
		@Param("courseId") courseId: CourseId,
		@Query() filter?: GroupFilter
	): Promise<GroupDto[]> {
		
		return PaginatedResult(this.groupService.getGroupsOfCourse(courseId, filter), request);
	}

	@Get("history")
	@ApiOperation({
		operationId: "getGroupHistoryOfCourse",
		summary: "Get group history of course.",
		description: "Retrieves all group events of the course."
	})
	getGroupHistoryOfCourse(@Param("courseId") courseId: CourseId): Promise<GroupEventDto[]> {

		return this.groupService.getGroupHistoryOfCourse(courseId);
	}

	@Get("assignments/:assignmentId/with-assigned-evaluator")
	@ApiOperation({
		operationId: "getGroupsWithAssignedEvaluator",
		summary: "Get groups with assigned evaluator.",
		description: "Retrieves groups with their assigned evaluator for an assignment"
	})
	async getGroupsWithAssignedEvaluator(
		@Req() request: Request,
		@Param("courseId") courseId: CourseId,
		@Param("assignmentId") assignmentId: string,
		@Query() filter?: AssignedEvaluatorFilter
	): Promise<GroupWithAssignedEvaluatorDto[]> {
		const [groups, count] = await this.queryBus.execute(
			new GroupsWithAssignedEvaluatorQuery(courseId, assignmentId, new AssignedEvaluatorFilter(filter))
		);
		setTotalCountHeader(request, count);
		return groups;
	} 	

	@Get(":groupId")
	@ApiOperation({
		operationId: "getGroup",
		summary: "Get group.",
		description: "Returns the group with its course, users, assessments and history."
	})
	getGroup(
			@Param("courseId") courseId: CourseId,
			@Param("groupId") groupId: GroupId
	): Promise<GroupDto> {
		return this.groupService.getGroup(groupId);
	}


	@Get(":groupId/users")
	@ApiOperation({
		operationId: "getUsersOfGroup",
		summary: "Get users of group.",
		description: "Retrieves all users that are members of the group."
	})
	getUsersOfGroup(
		@Param("courseId") courseId: CourseId,
		@Param("groupId") groupId: GroupId
	): Promise<ParticipantDto[]> {

		return this.groupService.getUsersOfGroup(groupId);
	}

	@ApiOperation({
		operationId: "updateGroup",
		summary: "Update group.",
		description: "Updates the group partially."
	})
	@Patch(":groupId")
	@UseGuards(GroupGuard)
	updateGroup(
		@Param("courseId") courseId: CourseId,
		@Param("groupId") groupId: GroupId,
		@GetCourse() course: Course,
		@GetGroup() group: Group,
		@Body() update: GroupUpdateDto
	): Promise<GroupDto> {

		return this.groupService.updateGroup(course, group, update);
	}

	@Delete(":groupId/users/:userId")
	@ApiOperation({
		operationId: "removeUserFromGroup",
		summary: "Remove user.",
		description: "Removes the user from the group."
	})
	removeUserFromGroup(
		@Param("courseId") courseId: CourseId,
		@Param("groupId") groupId: GroupId,
		@Param("userId") userId: UserId,
		@Body("reason") reason?: string
	): Promise<void> {

		return this.groupService.removeUser(groupId, userId, reason);
	}

	@Delete(":groupId")
	@ApiOperation({
		operationId: "deleteGroup",
		summary: "Delete group.",
		description: "Deletes the group."
	})
	deleteGroup(
		@Param("courseId") courseId: CourseId,
		@Param("groupId") groupId: GroupId
	): Promise<void> {

		return throwIfRequestFailed(
			this.groupService.deleteGroup(groupId),
			`Failed to delete group (${groupId})`
		);
	}

}
