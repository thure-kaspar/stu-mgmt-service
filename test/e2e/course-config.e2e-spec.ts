import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { getConnection } from "typeorm";
import { AdmissionCriteriaDto } from "../../src/course/dto/course-config/admission-criteria.dto";
import { AssignmentTemplateDto } from "../../src/course/dto/course-config/assignment-template.dto";
import {
	CourseConfigDto,
	CourseConfigUpdateDto
} from "../../src/course/dto/course-config/course-config.dto";
import {
	GroupSettingsDto,
	GroupSettingsUpdateDto
} from "../../src/course/dto/course-config/group-settings.dto";
import { CourseDto } from "../../src/course/dto/course/course.dto";
import { createApplication } from "../mocks/application.mock";
import { ADMISSION_CRITERIA_MOCK } from "../mocks/course-config/admission-criteria.mock";
import { COURSE_CONFIG_JAVA_1920 } from "../mocks/course-config/course-config.mock";
import { GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF } from "../mocks/course-config/group-settings.mock";
import { COURSE_JAVA_1920 } from "../mocks/courses.mock";
import { DbMockService } from "../mocks/db-mock.service";
import { USER_STUDENT_2_JAVA, USER_STUDENT_JAVA } from "../mocks/users.mock";
import { copy } from "../utils/object-helper";

let app: INestApplication;
let dbMockService: DbMockService;
const course: CourseDto = COURSE_JAVA_1920;

describe("POST-REQUEST of CourseConfigController (e2e)", () => {
	beforeEach(async () => {
		app = await createApplication();
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createCourses();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(POST) .../config Creates configuration and returns it", () => {
		const config = copy(COURSE_CONFIG_JAVA_1920);
		const expected = COURSE_CONFIG_JAVA_1920;

		return request(app.getHttpServer())
			.post(`/courses/${course.id}/config`)
			.send(config)
			.expect(201)
			.expect(({ body }) => {
				const result = body as CourseConfigDto;
				expect(result).toEqual(expected);
			});
	});

	it("(POST) .../config/admission-criteria Creates admission criteria and returns it", async () => {
		await dbMockService.createCourseConfig();
		const config = copy(COURSE_CONFIG_JAVA_1920);
		const criteria = copy(ADMISSION_CRITERIA_MOCK);
		const expected = ADMISSION_CRITERIA_MOCK;

		return request(app.getHttpServer())
			.post(`/courses/${course.id}/config/${config.id}/admission-criteria`)
			.send(criteria)
			.expect(201)
			.expect(({ body }) => {
				const result = body as AdmissionCriteriaDto;
				expect(result).toEqual(expected);
			});
	});
});

describe("PUT-REQUEST of CourseConfigController (e2e)", () => {
	beforeEach(async () => {
		app = await createApplication();
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	describe("(PUT) courses/{courseId}/config/admission-from-previous-semester", () => {
		it("With matrNrs -> Returns DTO", () => {
			const matrNrs = [USER_STUDENT_JAVA.matrNr, USER_STUDENT_2_JAVA.matrNr];

			return request(app.getHttpServer())
				.put(`/courses/${course.id}/config/admission-from-previous-semester`)
				.send(matrNrs)
				.expect(200)
				.expect(({ body }) => {
					expect(body).toMatchSnapshot();
				});
		});

		it("Empty array -> Clears existing data", () => {
			const matrNrs = [];

			return request(app.getHttpServer())
				.put(`/courses/${course.id}/config/admission-from-previous-semester`)
				.send(matrNrs)
				.expect(200)
				.expect(({ body }) => {
					expect(body).toMatchSnapshot();
				});
		});

		it("No payload -> Returns status code 400", () => {
			return request(app.getHttpServer())
				.put(`/courses/${course.id}/config/admission-from-previous-semester`)
				.expect(400);
		});
	});
});

describe("GET-REQUESTS of CourseConfigConroller (e2e)", () => {
	beforeAll(async () => {
		app = await createApplication();
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createAll();
	});

	afterAll(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(GET) .../config Returns complete course configuration", () => {
		const expected = COURSE_CONFIG_JAVA_1920;

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/config`)
			.expect(200)
			.expect(({ body }) => {
				const result = body as CourseConfigDto;
				expect(result).toEqual(expected);
			});
	});

	it("(GET) .../config/group-settings Returns group settings", () => {
		const expected = COURSE_CONFIG_JAVA_1920.groupSettings;

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/config/group-settings`)
			.expect(200)
			.expect(({ body }) => {
				const result = body as GroupSettingsDto;
				expect(result).toEqual(expected);
			});
	});

	it("(GET) .../config/admission-criteria Returns admission criteria", () => {
		const expected = COURSE_CONFIG_JAVA_1920.admissionCriteria;

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/config/admission-criteria`)
			.expect(200)
			.expect(({ body }) => {
				const result = body as AdmissionCriteriaDto;
				expect(result).toEqual(expected);
			});
	});

	it("(GET) .../config/assignment-templates Returns assignment templates", () => {
		const expected = COURSE_CONFIG_JAVA_1920.assignmentTemplates;

		return request(app.getHttpServer())
			.get(`/courses/${course.id}/config/assignment-templates`)
			.expect(200)
			.expect(({ body }) => {
				const result = body as AssignmentTemplateDto[];
				expect(result).toEqual(expected);
			});
	});
});

describe("PATCH-REQUEST of CourseConfigController (e2e)", () => {
	beforeEach(async () => {
		app = await createApplication();
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createCourses();
		await dbMockService.createCourseConfig();
		await dbMockService.createGroupSettings();
		await dbMockService.createAdmissionCriteria();
		await dbMockService.createAssignmentTemplates();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(PATCH) .../config Updates course config (no relations)", () => {
		const expected = copy(COURSE_CONFIG_JAVA_1920);
		expected.password = "newPassword";
		expected.subscriptionUrl = "http://new-url.com/api";

		const update: CourseConfigUpdateDto = {
			password: expected.password,
			subscriptionUrl: expected.subscriptionUrl
		};

		return request(app.getHttpServer())
			.patch(`/courses/${course.id}/config`)
			.send(update)
			.expect(200)
			.expect(({ body }) => {
				const result = body as CourseConfigDto;
				expect(result).toEqual(expected);
			});
	});

	it("(PATCH) .../config/group-settings Updates group settings", () => {
		const groupSettings = copy(GROUP_SETTINGS_GROUPS_ALLOWED_MIN2_MAX3_SELF);
		groupSettings.nameSchema += "Update";
		groupSettings.allowGroups = !groupSettings.allowGroups;
		groupSettings.selfmanaged = !groupSettings.selfmanaged;
		groupSettings.sizeMin += 1;
		groupSettings.sizeMax += 1;

		const update: GroupSettingsUpdateDto = {
			nameSchema: groupSettings.nameSchema,
			allowGroups: groupSettings.allowGroups,
			selfmanaged: groupSettings.selfmanaged,
			sizeMin: groupSettings.sizeMin,
			sizeMax: groupSettings.sizeMax
		};

		return request(app.getHttpServer())
			.patch(`/courses/${course.id}/config/group-settings`)
			.send(update)
			.expect(200)
			.expect(({ body }) => {
				const result = body as GroupSettingsDto;
				expect(result).toEqual(groupSettings);
			});
	});

	it("(PATCH) .../config/admission-criteria Updates admission criteria", () => {
		const criteria = copy(ADMISSION_CRITERIA_MOCK);
		criteria.rules[0].requiredPercent = 55; // Change required percent
		criteria.rules = [criteria.rules[0], criteria.rules[1]]; // Remove one rule

		return request(app.getHttpServer())
			.patch(`/courses/${course.id}/config/admission-criteria`)
			.send(criteria)
			.expect(200)
			.expect(({ body }) => {
				const result = body as AdmissionCriteriaDto;
				expect(result).toEqual(criteria);
			});
	});
});

describe("DELETE-REQUEST of CourseConfigController (e2e)", () => {
	beforeEach(async () => {
		app = await createApplication();
		dbMockService = new DbMockService(getConnection());
		await dbMockService.createCourses();
		await dbMockService.createCourseConfig();
		await dbMockService.createGroupSettings();
		await dbMockService.createAdmissionCriteria();
		await dbMockService.createAssignmentTemplates();
	});

	afterEach(async () => {
		await getConnection().dropDatabase(); // Drop database with all tables and data
		await getConnection().close(); // Close Db-Connection after all tests have been executed
	});

	it("(DELETE) .../config Deletes complete config", () => {
		return request(app.getHttpServer()).delete(`/courses/${course.id}/config/`).expect(200);
	});

	it("(DELETE) .../config/admission-criteria Deletes admission criteria ", () => {
		return request(app.getHttpServer())
			.delete(`/courses/${course.id}/config/admission-criteria`)
			.expect(200);
	});
});
