import { Controller, Get, Param, ParseUUIDPipe, Post, Delete, Patch, Body } from "@nestjs/common";
import { GroupService } from "../services/group.service";
import { UserDto } from "../../shared/dto/user.dto";
import { ApiTags } from "@nestjs/swagger";
import { GroupDto } from "../../shared/dto/group.dto";

@ApiTags("groups")
@Controller("courses/:courseId/groups")
export class GroupController {
	constructor(private groupService: GroupService) { }

	@Post()
	createGroup(
		@Param("courseId") courseId: string,
		@Body() groupDto: GroupDto
	): Promise<GroupDto> {

		return this.groupService.createGroup(courseId, groupDto);
	}
	
	@Post(":groupId/users/:userId")
	addUserToGroup(
		@Param("courseId") courseId: string,
		@Param("groupId", ParseUUIDPipe) groupId: string,
		@Param("userId", ParseUUIDPipe) userId: string,
		@Body("password") password?: string
	): Promise<any> {

		return this.groupService.addUserToGroup(groupId, userId, password);
	}

	@Get()
	getGroupsOfCourse(
		@Param("courseId") courseId: string,
	): Promise<GroupDto[]> {
		
		return this.groupService.getGroupsOfCourse(courseId);
	}

	@Get(":groupId/users")
	getUsersOfGroup(
		@Param("courseId") courseId: string,
		@Param("groupId", ParseUUIDPipe) groupId: string
	): Promise<UserDto[]> {

		return this.groupService.getUsersOfGroup(groupId);
	}

	@Patch(":groupId")
	updateGroup(
		@Param("courseId") courseId: string,
		@Param("groupId", ParseUUIDPipe) groupId: string,
		@Body() groupDto: GroupDto
	): Promise<GroupDto> {

		return this.groupService.updateGroup(groupId, groupDto);
	}

	@Delete(":groupId")
	deleteGroup(
		@Param("courseId") courseId: string,
		@Param("groupId", ParseUUIDPipe) groupId: string
	): Promise<boolean> {

		return this.groupService.deleteGroup(groupId);
	}

}
