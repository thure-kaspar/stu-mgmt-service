// import { Injectable } from "@nestjs/common";
import { Connection, EntityManager } from "typeorm";
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
import { ASSIGNMENT_TEMPLATES_MOCK } from "./course-config/assignment-templates.mock";
import { GROUP_SETTINGS_MOCK } from "./course-config/group-settings.mock";
import { ADMISSION_CRITERIA_JAVA } from "./course-config/admission-criteria.mock";
import { GroupSettings } from "../../src/course/entities/group-settings.entity";
import { AdmissionCritera } from "../../src/course/entities/admission-criteria.entity";
import { AssignmentTemplate } from "../../src/course/entities/assignment-template.entity";
import { CourseConfig } from "../../src/course/entities/course-config.entity";
import { COURSE_CONFIGS_MOCK } from "./course-config/course-config.mock";

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
	assignmentTemplates = ASSIGNMENT_TEMPLATES_MOCK;
	groupSettings = GROUP_SETTINGS_MOCK;
	admissionCriteria = ADMISSION_CRITERIA_JAVA;
	configs = COURSE_CONFIGS_MOCK;
	
	constructor(connection: Connection) { 
		this.con = connection.manager;
	}

	/**
	 * Fills the database with test data.
	 * @memberof DbMockService
	 */
	async createAll(): Promise<void> {
		await this.createCourses();
		await this.createCourseConfig();
		await this.createAssignmentTemplates();
		await this.createAdmissionCriteria();
		await this.createGroupSettings();
		await this.createUsers();
		await this.createGroups();
		await this.createAssignments();
		await this.createAssessments();
		await this.createCourseUserRelations();
		await this.createUserGroupRelations();
		await this.createAssessmentUserRelations();
	}

	async createCourses(): Promise<void> {
		const repo = this.con.getRepository(Course);
		const courses = this.courses.map(c => repo.create(c));

		await repo.save(courses)
			.catch(error => console.log(error));
	}

	async createCourseConfig(): Promise<void> {
		const repo = this.con.getRepository(CourseConfig);
		const configs = repo.create(this.configs);

		let id = 1;

		configs.forEach(c => {
			c.courseId = this.courses[id - 1].id;
			id++;
		});

		await repo.insert(configs)
			.catch(error => console.log(error));
	}

	async createGroupSettings(): Promise<void> {
		const repo = this.con.getRepository(GroupSettings);
		const settings = repo.create(this.groupSettings);

		let configId = 1;
		settings.forEach(s => s.courseConfigId = configId++);

		await repo.insert(settings)
			.catch(error => console.error(error));
	}

	async createAdmissionCriteria(): Promise<void> {
		const repo = this.con.getRepository(AdmissionCritera);
		const crit = repo.create(this.admissionCriteria);
		crit.courseConfigId = 1;
		crit.admissionCriteria = this.admissionCriteria;
		await repo.insert(crit)
			.catch(error => console.error(error));
	}

	async createAssignmentTemplates(): Promise<void> {
		const repo = this.con.getRepository(AssignmentTemplate);
		const templates = this.assignmentTemplates.map(t => repo.create(t));
		templates.forEach(t => t.courseConfigId = 1);

		await this.con.getRepository(AssignmentTemplate).insert(templates)
			.catch(error => console.error(error));
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
