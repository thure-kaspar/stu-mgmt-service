import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnection } from 'typeorm';
import { DbMockService } from "./mocks/db-mock.service";
import * as fromDtoMocks from "./mocks/dto-mocks";

let dbMockService: DbMockService; // Should be initialized in every describe-block

const courses = fromDtoMocks.CoursesMock;
const groups = fromDtoMocks.GroupsMock;
const users = fromDtoMocks.UsersMock;
const assignments = fromDtoMocks.AssignmentsMock;
const assessments = fromDtoMocks.AssessmentsMock;

describe('POST-REQUESTS for relations (Db contains data) of GroupController (e2e)', () => {
	let app: INestApplication;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();

		// Setup mocks - these tests require a filled db
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createCourses();
		await dbMockService.createUsers();
		await dbMockService.createCourseUserRelations();
		await dbMockService.createGroups();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) /groups/{groupId}/users/{userId} Adds the user to the group", () => {
		return request(app.getHttpServer())
			.post(`/groups/${groups[0].id}/users/${users[0].id}`)
			.expect(201)
	});

});
