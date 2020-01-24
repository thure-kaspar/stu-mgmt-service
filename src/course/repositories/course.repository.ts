import { Repository, EntityRepository } from "typeorm";
import { Course } from "../../shared/entities/course.entity";
import { CourseDto } from "../../shared/dto/course.dto";

@EntityRepository(Course)
export class CourseRepository extends Repository<Course> {

    async createCourse(courseDto: CourseDto): Promise<Course> {
        const course = this.createEntityFromDto(courseDto);
        const createdCourse = await course.save();
        return createdCourse;
    }

    async getAllCourses(): Promise<Course[]> {
        return await this.find();
    }

    async getCourseById(id: number): Promise<Course> {
        return await this.findOne(id, { relations: ["courseUserRelations", "courseUserRelations.user"] });
    }

    async getCourseByNameAndSemester(name: string, semester: string): Promise<Course> {
        return await this.findOne({
            where: {
                shortname: name,
                semester: semester
            }});
    }

    private createEntityFromDto(courseDto: CourseDto): Course {
        const course = new Course();
        course.shortname = courseDto.shortname;
        course.semester = courseDto.semester;
        course.title = courseDto.title;
        course.isClosed = courseDto.isClosed;
        course.password = courseDto.password;
        return course;
    }

}
