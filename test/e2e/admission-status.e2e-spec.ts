import { AdmissionStatusDto } from "../../src/admission-status/dto/admission-status.dto";
import { PointsOverviewDto } from "../../src/admission-status/dto/points-overview.dto";
import { USER_STUDENT_JAVA } from "../mocks/users.mock";
import { TestSetup } from "../utils/e2e";

describe("Admission Status", () => {
	let setup: TestSetup;

	beforeAll(async () => {
		setup = await TestSetup.create();
		await setup.dbMockService.createAll();
	});

	afterAll(async () => {
		await setup.teardown();
	});

	const courseId = "java-wise1920";

	it("[GET] /courses/{courseId}/admission-status", () => {
		return setup
			.requestWithAuth("get", `/courses/${courseId}/admission-status`)
			.expect(200)
			.expect(({ body }) => {
				const result = body as AdmissionStatusDto[];
				expect(result).toHaveLength(4);
				expect(result).toMatchSnapshot();
			});
	});

	it("[GET] /courses/{courseId}/admission-status/{userId}", () => {
		return setup
			.requestWithAuth("get", `/courses/${courseId}/admission-status/${USER_STUDENT_JAVA.id}`)
			.expect(200)
			.expect(({ body }) => {
				const result = body as AdmissionStatusDto;
				expect(result).toMatchSnapshot();
			});
	});

	it("[GET] /courses/{courseId}/admission-status/overview", () => {
		return setup
			.requestWithAuth("get", `/courses/${courseId}/admission-status/overview`)
			.expect(200)
			.expect(({ body }) => {
				const result = body as PointsOverviewDto;
				expect(result.assignments).toHaveLength(2); // 2 evaluated assignments
				expect(result.results).toHaveLength(4); // 4 students
				expect(result).toMatchSnapshot();
			});
	});

	it("[GET] /courses/{courseId}/admission-status/overview/{userId}", () => {
		return setup
			.requestWithAuth(
				"get",
				`/courses/${courseId}/admission-status/overview/${USER_STUDENT_JAVA.id}`
			)
			.expect(200)
			.expect(({ body }) => {
				const result = body as PointsOverviewDto;
				expect(result.assignments).toHaveLength(2); // 2 evaluated assignments
				expect(result.results).toHaveLength(1);
				expect(result).toMatchSnapshot();
			});
	});
});
