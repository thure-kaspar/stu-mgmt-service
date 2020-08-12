import { BadRequestException } from "@nestjs/common";
import { Course as CourseEntity } from "../entities/course.entity";
import { GroupSettings } from "../entities/group-settings.entity";
import { GroupsForbiddenException } from "../exceptions/custom-exceptions";
import { Course } from "./course.model";
import { Group } from "./group.model";

export class CourseWithGroupSettings extends Course {

	private groupSettings: GroupSettings;

	constructor(course: CourseEntity, groupSettings: GroupSettings) {
		super(course);
		this.groupSettings = groupSettings;
	}

	isNotClosed(): CourseWithGroupSettings {
		super.isNotClosed();
		return this;
	}

	/**
	 * Asserts that group creation is allowed.
	 * @throws `GroupsForbiddenException` if group creation is not allowed.
	 */
	allowsGroupCreation(): CourseWithGroupSettings {
		if (!this.groupSettings.allowGroups) {
			throw new GroupsForbiddenException(this.id);
		}
		return this;
	}

	/**
	 * Asserts that group are allowed to manage themselves.
	 * @throws `BadRequestException` if groups are not allowed to manage themselves.
	 */
	allowsSelfManagedGroups(): CourseWithGroupSettings {
		if (!this.groupSettings.selfmanaged) {
			throw new BadRequestException(`Course (${this.id}) has disabled selfmanaged groups.`);
		}
		return this;
	}

	/**
	 * Asserts that the course is not enforcing a name schema.
	 * @throws `BadRequestException` if course enforcing a name schema.
	 */
	allowsGroupToRename(): CourseWithGroupSettings {
		if (this.groupSettings.nameSchema) {
			throw new BadRequestException(`Course (${this.id}) enforces a name schema.`);
		}
		return this;
	}

	/**
	 * Asserts that the group is allowed to close.
	 * @throws BadRequestException
	 */
	allowsGroupToClose(group: Group): CourseWithGroupSettings {
		if (this.groupSettings.sizeMin > group.members.length) {
			throw new BadRequestException(
				`Group (${group.id}) can't be closed, because it has less than ${this.groupSettings.sizeMin} members.`
			);
		}
		return this;
	}
}
