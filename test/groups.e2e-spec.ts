import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection } from 'typeorm';
import { DbMockService } from "./mocks/db-mock.service";
import { AssessmentDto } from "../src/shared/dto/assessment.dto";
import { AssignmentDto } from "../src/shared/dto/assignment.dto";
import { GroupDto } from "../src/shared/dto/group.dto";
import { CourseDto } from "../src/shared/dto/course.dto";
import { UserDto } from '../src/shared/dto/user.dto';

let courses: CourseDto[];
let users: UserDto[];
let groups: GroupDto[];
let assignments: AssignmentDto[];
let assessments: AssessmentDto[];

describe('POST-REQUESTS for relations (Db contains data) of GroupController (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		// Setup mocks - these tests require a filled db
		const dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
		courses = dbMockService.courses;
		users = dbMockService.users;
		groups = dbMockService.groups;
		assignments = dbMockService.assignments;
		assessments = dbMockService.assessments;
	});

	afterAll(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /groups/{groupId}/users/{userId} Adds the user to the group", () => {
		return request(app.getHttpServer())
			.post(`/groups/${groups[0].id}/users/${users[0].id}`)
			.expect(201)
	});

});
