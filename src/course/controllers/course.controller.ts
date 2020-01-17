import { Controller, Get, Param, ParseIntPipe, Post, Body, ParseUUIDPipe } from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { CourseDto } from 'src/shared/dto/course.dto';

@Controller('courses')
export class CourseController {
    constructor(private courseService: CourseService) {}

    @Post()
    createCourse(@Body() courseDto: CourseDto): Promise<CourseDto> {
        return this.courseService.createCourse(courseDto);
    }

    // CURRENTLY NOT WORKING: 400 - The value passed as UUID is not a string
    @Post("/:id/users/:userId")
    addUser(@Param(":id", ParseIntPipe) id: number,
            @Param(":userId", ParseUUIDPipe) userId: string): Promise<boolean> {

        return this.courseService.addUser(id, userId);
    }

    @Get()
    getAllCourses(): Promise<CourseDto[]> {
        return this.courseService.getAllCourses();
    }

    @Get(":id")
    getCourseById(@Param("id", ParseIntPipe) id: number): Promise<CourseDto> {
        return this.courseService.getCourseById(id);
    }

    @Get(":courseId/:semester")
    getCourseByCourseIdAndSemester(
        @Param("courseId", ParseIntPipe) courseId: number, 
        @Param("semester") semester: string): Promise<CourseDto> {

            return this.courseService.getCourseByCourseIdAndSemester(courseId, semester);
    }
}
