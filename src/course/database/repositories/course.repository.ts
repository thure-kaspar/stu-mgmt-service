import { Repository, EntityRepository } from "typeorm";
import { Course } from "../../../shared/entities/course.entity";
import { CourseDto } from "../../../shared/dto/course.dto";
import { CourseFilterDto } from "../../../shared/dto/course-filter.dto";
import { AdmissionCritera } from "../../entities/admission-criteria.entity";

@EntityRepository(Course)
export class CourseRepository extends Repository<Course> {

	/**
	 * Inserts a new course in the database. Includes the CourseConfig (with child-entities).
	 */
	async createCourse(courseDto: CourseDto): Promise<Course> {
		const course = this.createInsertableEntity(courseDto);
		return course.save();
	}

	async getCourses(filter?: CourseFilterDto): Promise<Course[]> {
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
		return this.findOne(id);
	}

	async getCourseByNameAndSemester(name: string, semester: string): Promise<Course> {
		return this.findOne({
			where: {
				shortname: name,
				semester: semester
			},
			relations: ["assignments"]
		});
	}

	async getCourseWithUsers(id: string): Promise<Course> {
		return this.findOne(id, { relations: ["courseUserRelations", "courseUserRelations.user"] });
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

	async getCourseWithGroups(courseId: string): Promise<Course> {
		return this.findOne(courseId, {
			relations: ["groups"]
		});
	}

	async updateCourse(courseId: string, courseDto: CourseDto): Promise<Course> {
		const course = await this.getCourseById(courseId);

		// TODO: Define Patch-Object or create method
		course.shortname = courseDto.shortname;
		course.semester = courseDto.semester;
		course.title = courseDto.title;
		course.isClosed = courseDto.isClosed;
		course.link = courseDto.link;
    
		return course.save();
	}

	async deleteCourse(courseId: string): Promise<boolean> {
		const deleteResult = await this.delete({
			id: courseId
		});
		return deleteResult.affected == 1;
	}

	/**
	 * Creates a Course entity from the given CourseDto, which should be used for insertion in the database.
	 */
	public createInsertableEntity(courseDto: CourseDto): Course {
		const course = this.create(courseDto);
		if (!course.config) throw new Error("CourseConfig is missing.");
		if (!course.config.groupSettings) throw new Error("GroupSettings are missing.");

		if (courseDto.config.admissionCriteria?.criteria?.length > 0) {
			course.config.admissionCriteria = new AdmissionCritera();
			course.config.admissionCriteria.admissionCriteria = courseDto.config.admissionCriteria;
		}

		return course;
	}

}
