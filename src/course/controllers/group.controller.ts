import { Controller, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { GroupService } from "../services/group.service";
import { UserDto } from "../../shared/dto/user.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("groups")
@Controller("groups")
export class GroupController {
	constructor(private groupService: GroupService) { }

	@Post(":id/users/:userId")
	addUserToGroup(
		@Param("id", ParseUUIDPipe) id: string,
		@Param("userId", ParseUUIDPipe) userId: string
	): Promise<any> {

		return this.groupService.addUserToGroup(id, userId);
	}

	@Get(":id/users")
	getUsersOfGroup(
		@Param("id", ParseUUIDPipe) id: string
	): Promise<UserDto[]> {

		return this.groupService.getUsersOfGroup(id);
	}

}