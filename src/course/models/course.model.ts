import { Course } from "../entities/course.entity";
import { CourseClosedException, GroupsForbiddenException } from "../exceptions/custom-exceptions";
import { BadRequestException } from "@nestjs/common";
import { Group } from "../entities/group.entity";
import { GroupSettings } from "../entities/group-settings.entity";

export class CourseModel {

	constructor(private course: Course) { }

	/**
	 * Asserts that the course is not closed.
	 * @throws `CourseClosedException` if course is closed.
	 */
	isNotClosed(): CourseModel {
		if (this.course.isClosed) {
			throw new CourseClosedException(this.course.id);
		}
		return this;
	}

	/**
	 * Asserts that group creation is allowed.
	 * @throws `GroupsForbiddenException` if group creation is not allowed.
	 */
	allowsGroupCreation(): CourseModel {
		if (!this.getGroupSettings().allowGroups) {
			throw new GroupsForbiddenException(this.course.id);
		}
		return this;
	}

	/**
	 * Asserts that group are allowed to manage themselves.
	 * @throws `BadRequestException` if groups are not allowed to manage themselves.
	 */
	allowsSelfManagedGroups(): CourseModel {
		if (!this.getGroupSettings().selfmanaged) {
			throw new BadRequestException(`Course (${this.course.id}) has disabled selfmanaged groups.`);
		}
		return this;
	}

	/**
	 * Asserts that the course is not enforcing a name schema.
	 * @throws `BadRequestException` if course enforcing a name schema.
	 */
	allowsGroupToRename(): CourseModel {
		if (this.getGroupSettings().nameSchema) {
			throw new BadRequestException(`Course (${this.course.id}) enforces a name schema.`);
		}
		return this;
	}

	/**
	 * Asserts that the group is allowed to close.
	 * @throws BadRequestException
	 */
	allowsGroupToClose(group: Group): CourseModel {
		if (this.getGroupSettings().sizeMin > group.userGroupRelations.length) {
			throw new BadRequestException(
				`Group (${group.id}) can't be closed, because it has less than ${this.getGroupSettings().sizeMin} members.`
			);
		}
		return this;
	}

	private getGroupSettings(): GroupSettings {
		return this.course.config.groupSettings;
	}

}
