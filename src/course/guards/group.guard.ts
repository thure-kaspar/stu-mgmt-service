import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Group as GroupEntity } from "../entities/group.entity";
import { GroupRepository } from "../repositories/group.repository";
import { Group } from "../models/group.model";

/**
 * Attaches the `group` (including members) to the `request`.
 * Always returns `true`, unless the group does not exist.
 */
@Injectable()
export class GroupGuard implements CanActivate {
	constructor(@InjectRepository(GroupEntity) private groups: GroupRepository) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const group = await this.groups.getGroupWithUsers(request.params.groupId);
		request.group = new Group(group);

		return true;
	}
}
