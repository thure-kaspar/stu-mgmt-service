import { Controller, Get, Param, ParseUUIDPipe, Post, Delete, Patch, Body } from "@nestjs/common";
import { GroupService } from "../services/group.service";
import { UserDto } from "../../shared/dto/user.dto";
import { ApiTags } from "@nestjs/swagger";
import { GroupDto } from "../../shared/dto/group.dto";

@ApiTags("groups")
@Controller("groups")
export class GroupController {
	constructor(private groupService: GroupService) { }

	@Post(":groupId/users/:userId")
	addUserToGroup(
		@Param("groupId", ParseUUIDPipe) groupId: string,
		@Param("userId", ParseUUIDPipe) userId: string,
		@Body("password") password?: string
	): Promise<any> {

		return this.groupService.addUserToGroup(groupId, userId, password);
	}

	@Get(":groupId/users")
	getUsersOfGroup(
		@Param("groupId", ParseUUIDPipe) groupId: string
	): Promise<UserDto[]> {

		return this.groupService.getUsersOfGroup(groupId);
	}

	@Patch(":groupId")
	updateGroup(
		@Param("groupId", ParseUUIDPipe) groupId: string,
		@Body() groupDto: GroupDto
	): Promise<GroupDto> {

		return this.groupService.updateGroup(groupId, groupDto);
	}

	@Delete(":groupId")
	deleteGroup(
		@Param("groupId", ParseUUIDPipe) groupId: string
	): Promise<boolean> {

		return this.groupService.deleteGroup(groupId);
	}

}
