import { Course as CourseEntity, CourseId } from "../entities/course.entity";
import { CourseClosedException } from "../exceptions/custom-exceptions";

export class Course {
	readonly id: CourseId;
	readonly shortname: string;
	readonly semester: string;
	readonly isClosed: boolean;

	constructor(private readonly course: CourseEntity) {
		this.id = course.id;
		this.shortname = course.shortname;
		this.semester = course.semester;
	}

	/**
	 * Asserts that the course is not closed.
	 * @throws `CourseClosedException` if course is closed.
	 */
	isNotClosed(): Course {
		if (this.isClosed) {
			throw new CourseClosedException(this.id);
		}
		return this;
	}

	/**
	 * Extends the `Course` with additional methods provided by the given `type`.
	 * The type should be another model that inherits from `Course` and takes in
	 * a course entity and the specified data(type) as constructor parameters.
	 * 
	 * @example course.with(CourseWithGroupSettings, groupSettings)
			.isNotClosed()
			.allowsGroupCreation();
	 */
	with<T extends Course, DType>(type: new (c: CourseEntity, d: DType) => T, data: DType): T {
		return new type(this.course, data);
	}
}
