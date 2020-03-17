import { Repository, EntityRepository } from "typeorm";
import { Course } from "../../../shared/entities/course.entity";
import { CourseDto } from "../../../shared/dto/course.dto";
import { CourseFilterDto } from "../../../shared/dto/course-filter.dto";

@EntityRepository(Course)
export class CourseRepository extends Repository<Course> {

	async createCourse(courseDto: CourseDto): Promise<Course> {
		const course = this.createEntityFromDto(courseDto);
		const createdCourse = await course.save();
		return createdCourse;
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
	
	async getCourseById(id: string): Promise<Course> {
		return this.findOne(id, {
			relations: ["assignments"]
		});
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
		course.password = courseDto.password;
		course.link = courseDto.link;
		course.allowGroups = courseDto.allowGroups;
		course.maxGroupSize = courseDto.maxGroupSize;
    
		return course.save();
	}

	async deleteCourse(courseId: string): Promise<boolean> {
		const deleteResult = await this.delete({
			id: courseId
		});
		return deleteResult.affected == 1;
	}

	private createEntityFromDto(courseDto: CourseDto): Course {
		const course = new Course();
		course.id = courseDto.id ?? courseDto.shortname + "-" + courseDto.semester; // If no id was supplied, <shortname-semester> will be the id
		course.shortname = courseDto.shortname;
		course.semester = courseDto.semester;
		course.title = courseDto.title;
		course.isClosed = courseDto.isClosed;
		course.password = courseDto.password;
		course.link = courseDto.link;
		course.allowGroups = courseDto.allowGroups;
		course.maxGroupSize = courseDto.maxGroupSize;
		return course;
	}

}
