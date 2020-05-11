import { Controller, Get, Param, Post, Delete, Patch, Body } from "@nestjs/common";
import { GroupService } from "../services/group.service";
import { UserDto } from "../../shared/dto/user.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { GroupDto } from "../dto/group/group.dto";
import { GroupCreateBulkDto } from "../dto/group/group-create-bulk.dto";
import { PasswordDto } from "../../shared/dto/password.dto";

@ApiTags("groups")
@Controller("courses/:courseId/groups")
export class GroupController {
	constructor(private groupService: GroupService) { }

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
