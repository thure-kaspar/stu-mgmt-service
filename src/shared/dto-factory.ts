import { Course } from "./entities/course.entity";
import { CourseDto } from "./dto/course.dto";
import { UserDto } from "./dto/user.dto";
import { User } from "./entities/user.entity";
import { GroupDto } from "./dto/group.dto";
import { Group } from "./entities/group.entity";
import { AssignmentDto } from "./dto/assignment.dto";
import { Assignment } from "./entities/assignment.entity";
import { Assessment } from "./entities/assessment.entity";
import { AssessmentDto } from "./dto/assessment.dto";

export abstract class DtoFactory {

    static createCourseDto(courseEntity: Course): CourseDto {
        const courseDto: CourseDto = {
            id: courseEntity.id,
            shortname: courseEntity.shortname,
            semester: courseEntity.semester,
            title: courseEntity.title,
            isClosed: courseEntity.isClosed,
            link: courseEntity.link,
            allowGroups: courseEntity.allowGroups,
            maxGroupSize: courseEntity.maxGroupSize
        };
    
        // Add relational data, if available
        if (courseEntity.courseUserRelations) {
            courseDto.users = []; 
            courseEntity.courseUserRelations.forEach(courseUserRelation => {
                courseDto.users.push(this.createUserDto(courseUserRelation.user));
            });
		}
		
		if (courseEntity.assignments) {
			courseDto.assignments = [];
			courseEntity.assignments.forEach(assignment => {
				courseDto.assignments.push(this.createAssignmentDto(assignment));
			});
		}

		if (courseEntity.groups) {
			courseDto.groups = [];
			courseEntity.groups.forEach(group => {
				courseDto.groups.push(this.createGroupDto(group));
			});
		}
    
        return courseDto;
    }
    
     static createUserDto(userEntity: User): UserDto {
        const userDto: UserDto = {
            id: userEntity.id,
            email: userEntity.email,
            role: userEntity.role,
        }
    
        // Add relational data, if available
        if (userEntity.courseUserRelations) {
            userDto.courses = [];
            userEntity.courseUserRelations.forEach(courseUserRelation => {
                userDto.courses.push(this.createCourseDto(courseUserRelation.course));
            });
        }
    
        return userDto;
    }
    
     static createGroupDto(groupEntity: Group): GroupDto {
        const groupDto: GroupDto = {
            id: groupEntity.id,
            courseId: groupEntity.courseId,
            name: groupEntity.name,
            isClosed:groupEntity.isClosed,
            course: groupEntity.course
        }
        return groupDto;
    }
    
     static createAssignmentDto(assignmentEntity: Assignment) {
        const assignmentDto: AssignmentDto = {
            id: assignmentEntity.id,
            courseId: assignmentEntity.courseId,
            name: assignmentEntity.name,
            state: assignmentEntity.state,
            startDate: assignmentEntity.startDate,
            endDate: assignmentEntity.endDate,
            comment: assignmentEntity.comment,
            link: assignmentEntity.link,
            type: assignmentEntity.type,
            maxPoints: assignmentEntity.maxPoints
        };
        return assignmentDto;
    }
    
     static createAssessmentDto(assessmentEntity: Assessment) {
        const assessmentDto: AssessmentDto = {
            id: assessmentEntity.id,
            assignmentId: assessmentEntity.assignmentId,
            groupId: assessmentEntity.groupId,
            achievedPoints: assessmentEntity.achievedPoints,
            comment: assessmentEntity.comment
        };
    
        if (assessmentEntity.group) {
            assessmentDto.group = this.createGroupDto(assessmentEntity.group);
        }
    
        return assessmentDto;
    }

}


