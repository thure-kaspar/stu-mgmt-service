import { BadRequestException } from "@nestjs/common";
import { Course as CourseEntity, CourseId } from "../entities/course.entity";
import { GroupSettings } from "../entities/group-settings.entity";
import { Group } from "../entities/group.entity";
import { CourseClosedException, GroupsForbiddenException } from "../exceptions/custom-exceptions";

export class Course {

	readonly id: CourseId;
	readonly shortname: string;
	readonly semester: string;

	constructor(private course: CourseEntity) {
		this.id = this.course.id;
		this.shortname = this.course.shortname;
		this.semester = this.course.semester;
	}

	and(): Course {
		return this;
	}

	/**
	 * Asserts that the course is not closed.
	 * @throws `CourseClosedException` if course is closed.
	 */
	isNotClosed(): Course {
		if (this.course.isClosed) {
			throw new CourseClosedException(this.course.id);
		}
		return this;
	}

	/**
	 * Asserts that group creation is allowed.
	 * @throws `GroupsForbiddenException` if group creation is not allowed.
	 */
	allowsGroupCreation(): Course {
		if (!this.getGroupSettings().allowGroups) {
			throw new GroupsForbiddenException(this.course.id);
		}
		return this;
	}

	/**
	 * Asserts that group are allowed to manage themselves.
	 * @throws `BadRequestException` if groups are not allowed to manage themselves.
	 */
	allowsSelfManagedGroups(): Course {
		if (!this.getGroupSettings().selfmanaged) {
			throw new BadRequestException(`Course (${this.course.id}) has disabled selfmanaged groups.`);
		}
		return this;
	}

	/**
	 * Asserts that the course is not enforcing a name schema.
	 * @throws `BadRequestException` if course enforcing a name schema.
	 */
	allowsGroupToRename(): Course {
		if (this.getGroupSettings().nameSchema) {
			throw new BadRequestException(`Course (${this.course.id}) enforces a name schema.`);
		}
		return this;
	}

	/**
	 * Asserts that the group is allowed to close.
	 * @throws BadRequestException
	 */
	allowsGroupToClose(group: Group): Course {
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
