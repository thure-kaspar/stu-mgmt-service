import { Repository, EntityRepository } from "typeorm";
import { Group } from "src/shared/entities/group.entity";
import { GroupDto } from "src/shared/dto/group.dto";
import { Course } from "src/shared/entities/course.entity";

@EntityRepository(Group)
export class GroupRepository extends Repository<Group> {

	async createGroup(course: Course, groupDto: GroupDto): Promise<Group> {
		const group = this.create(groupDto);
		group.course = course;
		return await group.save();
	}

}