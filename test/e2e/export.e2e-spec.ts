import { ExportService } from "../../src/export/export.service";
import {
	ASSIGNMENT_JAVA_EVALUATED,
	ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP
} from "../mocks/assignments.mock";
import { TestSetup } from "../utils/e2e";

describe("Export", () => {
	let setup: TestSetup;
	let exportService: ExportService;

	beforeAll(async () => {
		setup = await TestSetup.create();
		await setup.dbMockService.createAll();
		exportService = setup.app.get(ExportService);
	});

	afterAll(async () => {
		await setup.teardown();
	});

	describe("Assessments", () => {
		it("Assignment with assessments", async () => {
			const wb = await exportService.getAssessments(
				"java-wise1920",
				ASSIGNMENT_JAVA_EVALUATED.id
			);

			expect(wb).toBeDefined();
			expect(wb.getWorksheet(1)["_rows"]).toHaveLength(3);

			const columns = wb.getWorksheet(1).columns.map(c => c.key);
			expect(columns).toEqual([
				"assessmentId",
				"achievedPoints",
				"group",
				"member-1-name",
				"member-1-username",
				"member-1-matrNr",
				"member-2-name",
				"member-2-username",
				"member-2-matrNr"
			]);
		});

		it("Assignment without assessments", async () => {
			const wb = await exportService.getAssessments(
				"java-wise1920",
				ASSIGNMENT_JAVA_IN_PROGRESS_HOMEWORK_GROUP.id
			);

			expect(wb).toBeDefined();
			expect(wb.getWorksheet(1)["_rows"]).toHaveLength(0);
		});
	});
});
