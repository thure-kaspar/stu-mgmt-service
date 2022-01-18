import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Group } from "../models/group.model";
import { GroupRepository } from "../repositories/group.repository";

/**
 * Attaches the `group` (including members) to the `request`.
 * Always returns `true`, unless the group does not exist.
 * Ensures that the group belongs to `request.params.courseId`
 */
@Injectable()
export class GroupGuard implements CanActivate {
	constructor(@InjectRepository(GroupRepository) private groups: GroupRepository) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const { groupId, courseId } = request.params;

		const group = await this.groups.getGroupWithUsers(groupId);

		if (group.courseId !== courseId) {
			throw new NotFoundException(`Group (${groupId}) not found in course (${courseId}).`);
		}

		request.group = new Group(group);
		return true;
	}
}
