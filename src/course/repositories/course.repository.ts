import { Repository, EntityRepository } from "typeorm";
import { Course, CourseId } from "../entities/course.entity";
import { CourseDto } from "../dto/course/course.dto";
import { CourseFilter } from "../dto/course/course-filter.dto";
import { AdmissionCritera } from "../entities/admission-criteria.entity";
import { CourseConfig } from "../entities/course-config.entity";
import { GroupSettings } from "../entities/group-settings.entity";
import { AssignmentTemplate } from "../entities/assignment-template.entity";
import { CourseCreateDto } from "../dto/course/course-create.dto";
import { Participant } from "../entities/participant.entity";
import { CourseRole } from "../../shared/enums";
import { User } from "../../shared/entities/user.entity";

@EntityRepository(Course)
export class CourseRepository extends Repository<Course> {

	/**
	 * Inserts a new course in the database. Includes the CourseConfig (with child-entities).
	 * If lecturers are included in the Dto, the Participants will also be created.
	 */
	async createCourse(courseDto: CourseCreateDto): Promise<Course> {
		const course = this.createInsertableEntity(courseDto);
		
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

	async getCourses(filter?: CourseFilter): Promise<Course[]> {
		// Check if filter-object was supplied with properties
		if (filter && Object.keys(filter).length > 0) {
			const query = this.createQueryBuilder("course");
			if (!filter.title) filter.title = ""; // Need something for 1st where (?)
			query.where("course.title ilike :title", { title: "%" + filter.title + "%" });
			if (filter.shortname) query.andWhere("course.shortname = :shortname", { shortname: filter.shortname });
			if (filter.semester) query.andWhere("course.semester = :semester", { semester: filter.semester });

			return query.getMany();
		}
		
		// If no filter was supplied, return everything
		return this.find();
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
			},
			relations: ["assignments"]
		});
	}

	async getCourseWithUsers(id: string): Promise<Course> {
		return this.findOneOrFail(id, { relations: ["participants", "participants.user"] });
	}

	/**
	 * Returns the course with its course config. The course config does not include relations.
	 */
	async getCourseWithConfig(id: string): Promise<Course> {
		return this.findOneOrFail(id, { relations: ["config"] });
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
		course.link = courseDto.link;
    
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
	public createInsertableEntity(courseDto: CourseDto): Course {
		const course = new Course(); // TODO: Can't simply call this.create because admissionCriterias structure doesn't match. (Would remove the need for the code below)
		course.id = courseDto.id;
		course.shortname = courseDto.shortname;
		course.semester = courseDto.semester;
		course.title = courseDto.title;
		course.link = courseDto.link;
		course.isClosed = courseDto.isClosed;

		course.config = new CourseConfig();
		course.config.password = courseDto.config.password?.length > 0 ? courseDto.config.password : null; // Replace empty string with null
		course.config.subscriptionUrl = courseDto.config.subscriptionUrl;
	
		course.config.groupSettings = new GroupSettings();
		Object.assign(course.config.groupSettings, courseDto.config.groupSettings);

		course.config.assignmentTemplates = courseDto.config.assignmentTemplates?.map(t => {
			const template = new AssignmentTemplate();
			Object.assign(template, t);
			return template;
		});

		if (courseDto.config.admissionCriteria?.criteria?.length > 0) {
			course.config.admissionCriteria = new AdmissionCritera();
			course.config.admissionCriteria.admissionCriteria = courseDto.config.admissionCriteria;
		}

		return course;
	}

}
