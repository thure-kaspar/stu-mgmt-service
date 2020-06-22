import { Controller, Get, Param, Post, Delete, Patch, Body, Query, Res, Req } from "@nestjs/common";
import { GroupService } from "../services/group.service";
import { UserDto } from "../../shared/dto/user.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { GroupDto } from "../dto/group/group.dto";
import { GroupCreateBulkDto } from "../dto/group/group-create-bulk.dto";
import { PasswordDto } from "../../shared/dto/password.dto";
import { GroupEventDto } from "../dto/group/group-event.dto";
import { GroupWithAssignedEvaluatorDto, AssignedEvaluatorFilter } from "../queries/groups-with-assigned-evaluator/group-with-assigned-evaluator.dto";
import { QueryBus } from "@nestjs/cqrs";
import { GroupsWithAssignedEvaluatorQuery } from "../queries/groups-with-assigned-evaluator/groups-with-assigned-evaluator.query";
import { Request } from "express";
import { setTotalCountHeader } from "../../../test/utils/http-utils";

@ApiTags("groups")
@Controller("courses/:courseId/groups")
export class GroupController {
	constructor(private groupService: GroupService,
				private queryBus: QueryBus) { }

	@Post()
	@ApiOperation({
		operationId: "createGroup",
		summary: "Create group",
		description: "Creates a new group, if course allows group creation."
	})
	createGroup(
		@Param("courseId") courseId: string,
		@Body() groupDto: GroupDto
	): Promise<GroupDto> {

		return this.groupService.createGroup(courseId, groupDto);
	}

	@Post("bulk")
	@ApiOperation({
		operationId: "createMultipleGroups",
		summary: "Create multiple groups",
		description: "Creates multiple groups with the given names or naming schema and count."
	})
	createMultipleGroups(
		@Param("courseId") courseId: string,
		@Body() groupCreateBulk: GroupCreateBulkDto 
	): Promise<GroupDto[]> {

		return this.groupService.createMultipleGroups(courseId, groupCreateBulk);
	}
	
	@Post(":groupId/users/:userId")
	@ApiOperation({
		operationId: "addUserToGroup",
		summary: "Add user to group",
		description: "Adds the user to the group, if constraints are fulfilled."
	})
	addUserToGroup(
		@Param("courseId") courseId: string,
		@Param("groupId") groupId: string,
		@Param("userId") userId: string,
		@Body() password?: PasswordDto,
	): Promise<any> {

		return this.groupService.addUserToGroup(groupId, userId, password.password);
	}

	@Get()
	@ApiOperation({
		operationId: "getGroupsOfCourse",
		summary: "Get groups of course",
		description: "Retrieves all groups that belong to the course."
	})
	getGroupsOfCourse(
		@Param("courseId") courseId: string,
	): Promise<GroupDto[]> {
		
		return this.groupService.getGroupsOfCourse(courseId);
	}

	@Get("history")
	@ApiOperation({
		operationId: "getGroupHistoryOfCourse",
		summary: "Get group history of course",
		description: "Retrieves all group events of the course."
	})
	getGroupHistoryOfCourse(@Param("courseId") courseId: string): Promise<GroupEventDto[]> {

		return this.groupService.getGroupHistoryOfCourse(courseId);
	}

	@Get(":groupId/assignments/:assignmentId")
	@ApiOperation({
		operationId: "getGroupFromAssignment",
		summary: "Get snapshot of a group at assignment end",
		description: "Returns a snapshot of the group's members at the time of the assignment's end."
	})
	getGroupFromAssignment(
		@Param("courseId") courseId: string,
		@Param("groupId") groupId: string,
		@Param("assignmentId") assignmentId: string
	): Promise<GroupDto> {
		
		return this.groupService.getGroupFromAssignment(groupId, assignmentId);
	}

	@Get("assignments/:assignmentId")
	@ApiOperation({
		operationId: "getGroupsFromAssignment",
		summary: "Get snapshot of groups at assignment end",
		description: "Returns a snapshot of the group constellations at the time of the assignment's end."
	})
	getGroupsFromAssignment(
		@Param("courseId") courseId: string,
		@Param("assignmentId") assignmentId: string
	): Promise<GroupDto[]> {
		
		return this.groupService.getGroupsFromAssignment(courseId, assignmentId);
	}

	@Get("assignments/:assignmentId/with-assigned-evaluator")
	@ApiOperation({
		operationId: "getGroupsWithAssignedEvaluator",
		summary: "Get groups with assigned evaluator",
		description: "Retrieves groups with their assigned evaluator for an assignment"
	})
	async getGroupsWithAssignedEvaluator(
		@Req() request: Request,
		@Param("courseId") courseId: string,
		@Param("assignmentId") assignmentId: string,
		@Query() filter?: AssignedEvaluatorFilter
	): Promise<GroupWithAssignedEvaluatorDto[]> {
		const [groups, count] = await this.queryBus.execute(new GroupsWithAssignedEvaluatorQuery(courseId, assignmentId, filter));
		setTotalCountHeader(request, count);
		return groups;
	} 	

	@Get(":groupId")
	@ApiOperation({
		operationId: "getGroup",
		summary: "Get group",
		description: "Returns the group with its course, users, assessments and history."
	})
	getGroup(
			@Param("courseId") courseId: string,
			@Param("groupId") groupId: string
	): Promise<GroupDto> {
		return this.groupService.getGroup(groupId);
	}


	@Get(":groupId/users")
	@ApiOperation({
		operationId: "getUsersOfGroup",
		summary: "Get users of group",
		description: "Retrieves all users that are members of the group."
	})
	getUsersOfGroup(
		@Param("courseId") courseId: string,
		@Param("groupId") groupId: string
	): Promise<UserDto[]> {

		return this.groupService.getUsersOfGroup(groupId);
	}

	@Patch(":groupId")
	@ApiOperation({
		operationId: "updateGroup",
		summary: "Update group",
		description: "Updates the group"
	})
	updateGroup(
		@Param("courseId") courseId: string,
		@Param("groupId") groupId: string,
		@Body() groupDto: GroupDto
	): Promise<GroupDto> {

		return this.groupService.updateGroup(groupId, groupDto);
	}

	@Delete(":groupId/users/:userId")
	@ApiOperation({
		operationId: "removeUserFromGroup",
		summary: "Remove user",
		description: "Removes the user from the group."
	})
	removeUserFromGroup(
		@Param("courseId") courseId: string,
		@Param("groupId") groupId: string,
		@Param("userId") userId: string,
		@Body("reason") reason?: string
	): Promise<void> {

		return this.groupService.removeUser(groupId, userId, reason);
	}

	@Delete(":groupId")
	@ApiOperation({
		operationId: "deleteGroup",
		summary: "Delete group",
		description: "Deletes the group."
	})
	deleteGroup(
		@Param("courseId") courseId: string,
		@Param("groupId") groupId: string
	): Promise<boolean> {

		return this.groupService.deleteGroup(groupId);
	}

}
