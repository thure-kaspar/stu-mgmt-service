import { Controller, Get, Param, Post, Body, ParseUUIDPipe, Patch, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CourseService } from '../services/course.service';
import { CourseDto } from '../../shared/dto/course.dto';
import { GroupDto } from '../../shared/dto/group.dto';
import { GroupService } from '../services/group.service';
import { AssignmentDto } from '../../shared/dto/assignment.dto';
import { AssignmentService } from "../services/assignment.service";
import { AssessmentDto } from "../../shared/dto/assessment.dto";
import { AssessmentService } from "../services/assessment.service";

@ApiTags("courses") 
@Controller("courses")
export class CourseController {
	constructor(private courseService: CourseService,
				private groupService: GroupService,
				private assignmentService: AssignmentService,
				private assessmentService: AssessmentService) { }

	@Post()
	createCourse(@Body() courseDto: CourseDto): Promise<CourseDto> {
		return this.courseService.createCourse(courseDto);
	}

	@Post(":name/:semester/groups")
	createGroup(
		@Param("name") name: string,
		@Param("semester") semester: string,
		@Body() groupDto: GroupDto
	): Promise<GroupDto> {

		return this.groupService.createGroup(name, semester, groupDto);
	}

	@Post(":id/users/:userId")
	addUser(@Param("id") id: string,
			@Param("userId", ParseUUIDPipe) userId: string): Promise<any> {
		return this.courseService.addUser(id, userId);
	}

	@Post(":name/:semester/assignments")
	createAssignment(
		@Param("name") name: string,
		@Param("semester") semester: string,
		@Body() assignmentDto: AssignmentDto
	): Promise<AssignmentDto> {

		return this.assignmentService.createAssignment(name, semester, assignmentDto);
	}

	@Post(":name/:semester/assignments/:assignmentId/assessments")
	createAssessment(
		@Param("assignmentId", ParseUUIDPipe) assignmentId: string,
		@Body() assessmentDto: AssessmentDto
	): Promise<AssessmentDto> {

		// TODO: Check if user is allowed to submit assessments for this course
		return this.assessmentService.createAssessment(assignmentId, assessmentDto);
	}

	@Get()
	getAllCourses(): Promise<CourseDto[]> {
		return this.courseService.getAllCourses();
	}

	@Get(":id")
	getCourseById(@Param("id") id: string): Promise<CourseDto> {
		return this.courseService.getCourseById(id);
	}

	@Get(":name/:semester")
	getCourseByNameAndSemester(
		@Param("name") name: string,
		@Param("semester") semester: string
	): Promise<CourseDto> {

		return this.courseService.getCourseByNameAndSemester(name, semester);
	}

	@Get(":name/:semester/groups")
	getGroupsOfCourse(
		@Param("name") name: string,
		@Param("semester") semester: string
	): Promise<GroupDto[]> {

		return this.groupService.getGroupsOfCourse(name, semester);
	}

	@Get(":name/:semester/assignments")
	getAssignmentsOfCourse(
		@Param("name") name: string,
		@Param("semester") semester: string
	): Promise<AssignmentDto[]> {

		return this.assignmentService.getAssignments(name, semester);
	}

	@Get(":name/:semester/assignments/:assignmentId/assessments")
	getAllAssessmentsForAssignment(
		@Param("name") name: string,
		@Param("semester") semester: string,
		@Param("assignmentId", ParseUUIDPipe) assignmentId: string
	): Promise<AssessmentDto[]> {

		// TODO: Check if user is allowed to request all assessments
		return this.assessmentService.getAssessmentsForAssignment(assignmentId);
	}

	@Patch(":name/:semester")
	updateCourse(
		@Param("name") name: string,
		@Param("semester") semester: string,
		@Body() courseDto: CourseDto
	): Promise<CourseDto> {

		return this.courseService.updateCourse(name, semester, courseDto);
	}

	@Delete(":name/:semester")
	deleteCourse(
		@Param("name") name: string,
		@Param("semester") semester: string,
	): Promise<boolean> {

		this.courseService.deleteCourse(name, semester);
		return null;
	}



}
