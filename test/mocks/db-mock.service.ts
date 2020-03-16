// import { Injectable } from "@nestjs/common";
import { getConnection, Connection, EntityManager, BaseEntity } from "typeorm";
import { User } from "../../src/shared/entities/user.entity";
import { Group } from "../../src/shared/entities/group.entity";
import { Course } from "../../src/shared/entities/course.entity";
import { Assignment } from "../../src/shared/entities/assignment.entity";
import { Assessment } from "../../src/shared/entities/assessment.entity";
import { CourseUserRelation } from "../../src/shared/entities/course-user-relation.entity";
import { AssessmentUserRelation } from "../../src/shared/entities/assessment-user-relation.entity";
import { UserGroupRelation } from "../../src/shared/entities/user-group-relation.entity";
import { CoursesMock } from "./courses.mock";
import { AssessmentUserRelationsMock, UserGroupRelationsMock, CourseUserRelationsMock } from "./relations.mock";
import { AssessmentsMock } from "./assessments.mock";
import { AssignmentsMock } from "./assignments.mock";
import { UsersMock } from "./users.mock";
import { GroupsMock } from "./groups.mock";

//@Injectable() Not a "real" (injectable) service for now
export class DbMockService {

	private con: EntityManager;
	courses = CoursesMock
	groups = GroupsMock;
	users = UsersMock;
	assignments = AssignmentsMock;
	assessments = AssessmentsMock;
	courseUserRelations = CourseUserRelationsMock;
	userGroupRelations = UserGroupRelationsMock;
	assessmentUserRelations = AssessmentUserRelationsMock;
	
	constructor(connection: Connection) { 
		this.con = connection.manager;
	}

	/**
	 * Fills the database with test data.
	 * @memberof DbMockService
	 */
	async createAll(): Promise<void> {
		await this.createCourses();
		await this.createUsers();
		await this.createGroups();
		await this.createAssignments();
		await this.createAssessments();
		await this.createCourseUserRelations();
		await this.createUserGroupRelations();
		await this.createAssessmentUserRelations();
	}

	async createCourses(): Promise<void> {
		await this.con.getRepository(Course).insert(this.courses)
			.catch(error => console.log(error));
	}

	async createUsers(): Promise<void> {
		await this.con.getRepository(User).insert(this.users)
			.catch(error => console.error(error));
	}

	async createGroups(): Promise<void> {
		await this.con.getRepository(Group).insert(this.groups)
			.catch(error => console.error(error));
	}

	async createAssignments(): Promise<void> {
		await this.con.getRepository(Assignment).insert(this.assignments)
			.catch(error => console.error(error));
	}

	async createAssessments(): Promise<void> {
		await this.con.getRepository(Assessment).insert(this.assessments)
			.catch(error => console.error(error));
	}

	async createCourseUserRelations(): Promise<void> {
		await this.con.getRepository(CourseUserRelation).insert(this.courseUserRelations)
			.catch(error => console.error(error));
	}

	async createAssessmentUserRelations(): Promise<void> {
		await this.con.getRepository(AssessmentUserRelation).insert(this.assessmentUserRelations)
			.catch(error => console.error(error));
	}

	async createUserGroupRelations(): Promise<void> {
		await this.con.getRepository(UserGroupRelation).insert(this.userGroupRelations)
			.catch(error => console.error(error));
	}

}
