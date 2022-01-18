import { Repository, EntityRepository } from "typeorm";
import { Course, CourseId } from "../entities/course.entity";
import { CourseDto } from "../dto/course/course.dto";
import { CourseFilter } from "../dto/course/course-filter.dto";
import { AdmissionCriteria } from "../entities/admission-criteria.entity";
import { CourseConfig } from "../entities/course-config.entity";
import { GroupSettings } from "../entities/group-settings.entity";
import { CourseCreateDto } from "../dto/course/course-create.dto";
import { Participant } from "../entities/participant.entity";
import { CourseRole } from "../../shared/enums";
import { User, UserId } from "../../shared/entities/user.entity";
import { EntityNotFoundError } from "typeorm/error/EntityNotFoundError";
import { CourseConfigDto } from "../dto/course-config/course-config.dto";

@EntityRepository(Course)
export class CourseRepository extends Repository<Course> {
	/**
	 * Inserts a new course in the database. Includes the CourseConfig (with child-entities).
	 * If lecturers are included in the Dto, the Participants will also be created.
	 */
	async createCourse(courseDto: CourseCreateDto, config: CourseConfigDto): Promise<Course> {
		const course = this.createInsertableEntity(courseDto, config);

		if (courseDto.lecturers?.length > 0) {
			const userRepo = this.manager.getRepository(User);
			const lecturers = await userRepo.find({
				// username: username for each lecturer
				where: courseDto.lecturers.map(username => ({ username: username }))
			});

			const participants = lecturers.map(lecturer => {
				const relation = new Participant();
				relation.userId = lecturer.id;
				relation.role = CourseRole.LECTURER;
				return relation;
			});

			course.participants = participants;
		}

		return this.save(course);
	}

	async getCourses(filter?: CourseFilter): Promise<[Course[], number]> {
		// Check if filter-object was supplied with properties
		if (filter && Object.keys(filter).length > 0) {
			const query = this.createQueryBuilder("course");
			query.skip(filter?.skip);
			query.take(filter?.take);
			if (!filter.title) filter.title = ""; // Need something for 1st where (?)
			query.where("course.title ilike :title", { title: "%" + filter.title + "%" });
			if (filter.shortname)
				query.andWhere("course.shortname = :shortname", { shortname: filter.shortname });
			if (filter.semester)
				query.andWhere("course.semester = :semester", { semester: filter.semester });

			return query.getManyAndCount();
		}

		// If no filter was supplied, return everything
		return this.findAndCount();
	}

	/**
	 * Retrieves the course with the specified id.
	 */
	async getCourseById(id: string): Promise<Course> {
		return this.findOneOrFail(id);
	}

	async getCourseByNameAndSemester(name: string, semester: string): Promise<Course> {
		return this.findOneOrFail({
			where: {
				shortname: name,
				semester: semester
			}
		});
	}

	async getCourseWithUsers(id: string): Promise<Course> {
		return this.findOneOrFail(id, { relations: ["participants", "participants.user"] });
	}

	/**
	 * Retrieves a course with a specific participant.
	 * Includes relations:
	 * - Participants (1)
	 * - Participant.User
	 * @throws `EntityNotFoundError` if course or participant does not exist.
	 */
	async getCourseWithParticipant(id: CourseId, userId: UserId): Promise<Course> {
		const query = this.createQueryBuilder("course")
			.where("course.id = :id", { id })
			.innerJoinAndSelect(
				"course.participants",
				"participant",
				"participant.userId = :userId",
				{ userId }
			)
			.innerJoinAndSelect("participant.user", "user")
			.leftJoinAndSelect("participant.groupRelation", "groupRelation")
			.leftJoinAndSelect("groupRelation.group", "group");

		const course = await query.getOne();

		if (!course) throw new EntityNotFoundError(Course, { id, userId });
		return course;
	}

	/**
	 * Returns the course with its course config. Includes the following relations:
	 * - Config
	 * - GroupSettings
	 * - AdmissionCriteria
	 */
	async getCourseWithConfig(id: string): Promise<Course> {
		return this.findOneOrFail(id, {
			relations: ["config", "config.groupSettings", "config.admissionCriteria"]
		});
	}

	/**
	 * Returns the course with its course config. The course config includes the group settings.
	 */
	async getCourseWithConfigAndGroupSettings(id: string): Promise<Course> {
		return this.findOneOrFail(id, { relations: ["config", "config.groupSettings"] });
	}

	async getCourseWithGroups(courseId: CourseId): Promise<Course> {
		return this.findOneOrFail(courseId, {
			relations: ["groups"]
		});
	}

	async updateCourse(courseId: CourseId, courseDto: CourseDto): Promise<Course> {
		const course = await this.getCourseById(courseId);

		// TODO: Define Patch-Object or create method
		course.shortname = courseDto.shortname;
		course.semester = courseDto.semester;
		course.title = courseDto.title;
		course.isClosed = courseDto.isClosed;
		course.links = courseDto.links?.length > 0 ? courseDto.links : null;

		return this.save(course);
	}

	async deleteCourse(courseId: CourseId): Promise<boolean> {
		const deleteResult = await this.delete({
			id: courseId
		});
		return deleteResult.affected == 1;
	}

	/**
	 * Creates a Course entity from the given CourseDto, which should be used for insertion in the database.
	 */
	public createInsertableEntity(courseDto: CourseDto, configDto: CourseConfigDto): Course {
		const course = new Course(); // TODO: Can't simply call this.create because admissionCriterias structure doesn't match. (Would remove the need for the code below)
		course.id = courseDto.id;
		course.shortname = courseDto.shortname;
		course.semester = courseDto.semester;
		course.title = courseDto.title;
		course.links = courseDto.links?.length > 0 ? courseDto.links : null;
		course.isClosed = courseDto.isClosed;

		course.config = new CourseConfig();
		course.config.password = configDto.password?.length > 0 ? configDto.password : null; // Replace empty string with null

		course.config.groupSettings = new GroupSettings();
		Object.assign(course.config.groupSettings, configDto.groupSettings);

		course.config.admissionCriteria = new AdmissionCriteria();
		course.config.admissionCriteria.admissionCriteria = configDto.admissionCriteria ?? {
			rules: []
		};

		return course;
	}
}
